Discourse.SearchController.reopen({
  actions: {
    moreOfType: function(type) {
      if(type == 'topic'){
        term = this.get('term');
        this.transitionToRoute('search_topics.query', { query: term });
      }else{
        this._super(type);
      }
    }
  },

  searchTopicForTerm: function(){
    var self = this;

    var searcher = Discourse.SearchTopic.forTerm(self.get('term'), {
      searchContext: self.get('searchContext')
    });
    return searcher.then(function(results) {
      var urls = [];
      if (results) {
        self.set('noResults', results.length === 0);

        var index = 0;
        results = _(['topic'])
          .map(function(n){
            return _(results).where({type: n}).first();
          })
          .compact()
          .each(function(list){
            _.each(list.results, function(item){
              item.index = index++;
              urls.pushObject(item.url);
            });
          })
          .value();

        self.set('resultCount', index);
        self.set('content', results);
        self.set('urls', urls);
      }
      self.set('loading', false);
    }).catch(function() {
      self.set('loading', false);
    });
    return searcher;
  }

});