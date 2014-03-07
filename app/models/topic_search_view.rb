class TopicSearchView < Search
  include ActiveModel::Serialization

  attr_reader :topics, :filtered_topics, :filtered_ids, :guardian

  def initialize(current_user, opts=nil)
    @guardian = Guardian.new(current_user)
    @sort_context = opts[:sort_context].present? && opts.delete(:sort_context) || {}
    term = opts.delete(:term)
    super(term, opts)

    if opts[:post_ids]
      @topics = TopicList.new(:latest, current_user, topic_search(Post.where(id: opts[:post_ids]))).topics
    else
      @topics = TopicList.new(:latest, current_user, topic_search(posts_query(limit: 25))).topics
    end
  end

  def filtered_topic_ids
    @filtered_topic_ids = @term ? posts_query(limit: 500).pluck(:id) : []
  end

  def categories
    @categories = @term ? Category.joins(topics: {posts: :post_search_data}).where(posts: {id: posts_query}).order('position asc').distinct : []
    subcategories = {}
    to_delete = Set.new
    @categories.each do |c|
      if c.parent_category_id.present?
        subcategories[c.parent_category_id] ||= []
        subcategories[c.parent_category_id] << c.id
        to_delete << c
      end
    end
    if subcategories.present?
      @categories.each do |c|
        c.subcategory_ids = subcategories[c.id]
      end
      @categories.delete_if {|c| to_delete.include?(c) }
    end
    @categories
  end

  private

  def topic_search(posts)
    single_topic_posts = only_single_topic(posts)

    posts.map do |post|
      next if single_topic_posts[post.topic_id] != post
      topic = post.topic
      topic = topic.becomes(TopicSearchResult)
      if post.post_number == 1
        topic.result_url = topic.relative_url
      else
        topic.result_url = post.url
      end
      topic.result_post_id = post.id
      topic
    end.compact
  end

  def only_single_topic(posts)
    single_topic_posts = {}
    posts.each do |post|
      if single_topic_posts[post.topic_id]
        if single_topic_posts[post.topic_id].post_number > post.post_number
          single_topic_posts[post.topic_id] = post
        end
      else
        single_topic_posts[post.topic.id] = post
      end
    end
    single_topic_posts
  end

  def posts_query(options={})
    posts = Post.includes(:post_search_data, {:topic => :category})
    .where("post_search_data.search_data @@ #{ts_query}")
    .where("topics.deleted_at" => nil)
    .where("topics.visible")
    .where("topics.archetype <> ?", Archetype.private_message)
    .references(:post_search_data, {:topic => :category})

    # if category was selected
    if @search_context.present? && @search_context.is_a?(Category)
      posts = posts.where("categories.id = ? OR categories.parent_category_id = ?", @search_context.id,@search_context.id)
    end

    sort_order = "DESC"
    if @sort_context.present?
      sort_order = @sort_context[:sort_descending] == "true" ? "DESC" : "ASC"
      posts = case @sort_context[:sort_order]
        when "posts"
          posts.order("topics.posts_count #{sort_order}")
        when "likes"
          posts.order("topics.like_count #{sort_order}")
        when "views"
          posts.order("topics.views #{sort_order}")
        when "activity"
          posts.order("topics.created_at #{sort_order}")
        else
          posts
      end
    end

    # If we have a search context, prioritize those posts first
    if @search_context.present?
      if @search_context.is_a?(Category)
        # If the context is a category, restrict posts to that category
        posts = posts.order("CASE WHEN topics.category_id = #{@search_context.id} THEN 0 ELSE 1 END")
      end
    end

    posts = posts.order("TS_RANK_CD(TO_TSVECTOR(#{query_locale}, topics.title), #{ts_query}) #{sort_order}")
    .order("TS_RANK_CD(post_search_data.search_data, #{ts_query}) #{sort_order}")
    .order("topics.bumped_at #{sort_order}")

    if secure_category_ids.present?
      posts = posts.where("(categories.id IS NULL) OR (NOT categories.read_restricted) OR (categories.id IN (?))", secure_category_ids).references(:categories)
    else
      posts = posts.where("(categories.id IS NULL) OR (NOT categories.read_restricted)").references(:categories)
    end

    if options[:limit]
      posts.limit(options[:limit])
    else
      posts
    end
  end

end