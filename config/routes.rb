Rails.application.routes.draw do

  get "topics/search",         to: 'topics_search#index'
  get "topics/search/q/:term", to: 'topics_search#topic_query'

end
