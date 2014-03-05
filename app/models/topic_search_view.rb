class TopicSearchView < Search
  def initialize(term, opts=nil)
    @sort_context = opts[:sort_context].present? && opts.delete(:sort_context) || {}
    super(term, opts)
  end

  def execute
    @topics = topic_search(posts_query(10))
  end

  private

  def topic_search(posts)
    posts.map do |post|
      topic = post.topic
      topic = topic.becomes(TopicSearchResult)
      if post.post_number == 1
        topic.result_url = topic.relative_url
      else
        topic.result_url = post.url
      end
      topic
    end
  end

  def posts_query(limit)
    posts = Post.includes(:post_search_data, {:topic => :category})
    .where("post_search_data.search_data @@ #{ts_query}")
    .where("topics.deleted_at" => nil)
    .where("topics.visible")
    .where("topics.archetype <> ?", Archetype.private_message)
    .references(:post_search_data, {:topic => :category})

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

      if @search_context.is_a?(User)
        # If the context is a user, prioritize that user's posts
        posts = posts.order("CASE WHEN posts.user_id = #{@search_context.id} THEN 0 ELSE 1 END")
      elsif @search_context.is_a?(Category)
        # If the context is a category, restrict posts to that category
        posts = posts.order("CASE WHEN topics.category_id = #{@search_context.id} THEN 0 ELSE 1 END")
      elsif @search_context.is_a?(Topic)
        posts = posts.order("CASE WHEN topics.id = #{@search_context.id} THEN 0 ELSE 1 END,
                               CASE WHEN topics.id = #{@search_context.id} THEN posts.post_number ELSE 999999 END")
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
    posts.limit(limit)
  end

end