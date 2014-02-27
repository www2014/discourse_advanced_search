Rails.application.routes.draw do

  get "search/topics", to: 'search_topics#index'
  get "search/topics/q/:query", to: 'search_topics#query'

end
