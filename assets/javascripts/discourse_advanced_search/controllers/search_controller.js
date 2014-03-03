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
  }
});