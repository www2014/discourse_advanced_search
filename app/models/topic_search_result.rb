class TopicSearchResult < Topic
  include ActiveModel::Serialization

  attr_accessor :result_url,
                :result_post_id
end