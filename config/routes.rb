Rails.application.routes.draw do

  get "topics/search/q/:term", to: 'topics_search#topic_query'
  get "topics/search/posts", to: 'topics_search#posts'

end
