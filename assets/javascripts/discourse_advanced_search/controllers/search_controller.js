Discourse.SearchController.reopen({
  actions: {
    moreOfType: function(type) {
      if(type == 'topic'){
        term = this.get('term');
        var topicSearch = Discourse.TopicSearch.create();
        topicSearch.set('query', term);
        this.transitionToRoute('topics_search', topicSearch);
      }else{
        this._super(type);
      }
    }
  }
});