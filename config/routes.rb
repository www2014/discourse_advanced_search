Rails.application.routes.draw do

  get "search/topics", to: 'search_topics#index'
  get "search/topics/q/:term", to: 'search_topics#topic_query'

end
