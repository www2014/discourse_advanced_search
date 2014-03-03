Discourse.Route.buildRoutes(function() {
  this.resource('topics_search', { path: 'topics/search/' }, function(){
    this.route('query', { path: 'q/:query' });
  });
});