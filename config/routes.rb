Rails.application.routes.draw do

  get "topics/search/q/:term", to: 'topics_search#topic_query'

end
