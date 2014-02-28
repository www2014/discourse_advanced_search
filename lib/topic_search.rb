class TopicSearch < Search
  def initialize(term, opts=nil)
    super(term, opts)
  end

  # Add more topics if we expected them
  def add_more_topics_if_expected
    expected_topics = 0
    expected_topics = Search.facets.size unless @results.type_filter.present?
    expected_topics = Search.per_facet * Search.facets.size if @results.type_filter == 'topic'
    expected_topics -= @results.topic_count
    if expected_topics > 0
      extra_posts = posts_query(expected_topics * Search.burst_factor)
      extra_posts = extra_posts.where("posts.topic_id NOT in (?)", @results.topic_ids) if @results.topic_ids.present?
      extra_posts.each do |p|
        @results.add_result(TopicSearchResult.from_post(p))
      end
    end
  end

  private

  def topic_search

    # If we have a user filter, search all posts by default with a higher limit
    posts = if @search_context.present? and @search_context.is_a?(User)
              posts_query(@limit * Search.burst_factor)
            else
              posts_query(@limit).where(post_number: 1)
            end

    posts.each do |post|
      @results.add_result(TopicSearchResult.from_post(post))
    end
  end
end