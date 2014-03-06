class TopicSearchItemSerializer < TopicListItemSerializer

  attributes :relative_url,
             :result_post_id

  def relative_url
    object.result_url
  end

  def result_post_id
    object.result_post_id
  end

  def posters
    []
  end

end