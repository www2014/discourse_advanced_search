module TopicStreamSerializerMixin

  def self.included(klass)
    klass.attributes :topic_stream
  end

  def topic_stream
    result = { topics: topics, stream: object.filtered_topic_ids }
    result
  end

  def topics
    return @topics if @topics.present?
    @topics = []
    if object.topics
      object.topics.each do |topic|
        serialized_topic = TopicSearchItemSerializer.new(topic, scope: object.guardian, root: false)

        @topics << serialized_topic.as_json
      end
    end
    @topics
  end

end
