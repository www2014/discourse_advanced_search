class TopicSearchViewSerializer < TopicListSerializer

  has_many :topics, serializer: TopicSearchItemSerializer, embed: :objects

end