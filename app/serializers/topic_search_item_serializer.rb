class TopicSearchItemSerializer < TopicListItemSerializer

  attributes :relative_url

  def relative_url
    object.result_url
  end

end