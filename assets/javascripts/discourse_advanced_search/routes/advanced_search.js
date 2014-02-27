Discourse.Route.buildRoutes(function() {
  this.resource('search_topics', { path: 'search/topics/' }, function(){
    this.route('query', { path: 'q/:query' });
  });
});