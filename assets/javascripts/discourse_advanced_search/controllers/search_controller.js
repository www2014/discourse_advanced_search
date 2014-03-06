Discourse.SearchController.reopen({
  actions: {
    moreOfType: function(type) {
      if(type == 'topic'){
        term = this.get('term');
        this.transitionToRoute('topics_search');
      }else{
        this._super(type);
      }
    }
  }
});