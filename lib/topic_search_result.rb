class TopicSearchResult < Search::SearchResult

  def initialize(row)
    row.symbolize_keys!
    @type = row.delete(:type).to_sym
    row.each_pair do |key, value|
      self.instance_variable_set(:"@#{key}", value)
    end
  end

  def as_json(options = nil)
    json = {id: @id,
            title: @title,
            url: @url,
            posts_count: @posts_count,
            like_count: @like_count,
            views: @views,
            created_at: @created_at,
            bumped_at: @bumped_at,
            bumped: @bumped,
            starred: @starred}
    json[:avatar_template] = @avatar_template if @avatar_template.present?
    json[:color] = @color if @color.present?
    json[:text_color] = @text_color if @text_color.present?
    json
  end

  def self.from_topic(topic, url, current_user=nil)
    user_data = current_user && TopicUser.where(topic_id: topic.id, user_id: current_user.id).first
    TopicSearchResult.new(type: :topic,
                          id: topic.id,
                          title: topic.title,
                          url: topic.relative_url,
                          posts_count: topic.posts_count,
                          like_count: topic.like_count,
                          views: topic.views,
                          created_at: topic.created_at,
                          bumped_at: topic.bumped_at,
                          bumped: topic.created_at < topic.bumped_at,
                          starred: user_data && user_data.starred?)
  end

  def self.from_post(post, current_user=nil)
    if post.post_number == 1
      # we want the topic link when it's the OP
      TopicSearchResult.from_topic(post.topic, post.topic.relative_url, current_user)
    else
      TopicSearchResult.from_topic(post.topic, post.url, current_user)
    end
  end
end