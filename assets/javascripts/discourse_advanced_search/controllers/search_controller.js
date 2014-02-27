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
    console.log(searcher);
    return searcher;
  }

});