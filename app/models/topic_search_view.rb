class TopicSearchView < Search
  def initialize(term, opts=nil)
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
end