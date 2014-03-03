class TopicSearchItemSerializer < ListableTopicSerializer

  attributes :relative_url

  def relative_url
    object.relative_url
  end

end