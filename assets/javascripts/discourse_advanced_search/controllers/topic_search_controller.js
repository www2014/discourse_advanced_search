Discourse.TopicSearchController = Discourse.ObjectController.extend(Discourse.Presence, {

  needs: "search",
  term: Em.computed.alias("controllers.search.term"),
  searchContext: Em.computed.alias("controllers.search.searchContext"),

  content: [],
  resultCount: false,
  urls: [],
  loading: true,
  topicStream: null,

  init: function(){
    var self = this;
    if ( typeof term == "undefined"){
      var path_split = window.location.pathname.split('/');
      self.set('term', path_split[path_split.length -1]);
    }
  },

  activeMainCategory: function(category){
    var self = this;
    var topicStream = self.get('topicStream'),
      categories = topicStream.get('categories');

    if (category.subcategories){
      var BreakException= {};
      try {
        categories.forEach(function(cat){
           if(cat.get('active')){
             cat.set('active', false);
             throw BreakException;
           }
        });
      } catch(e){
        // do something
      }
      category.set('active', true);
    }
    return;
  },

  searchTopicForTerm: function(options){
    if (!options) options = {};

    var self = this;
    var sortOrder = this.get('sortOrder');

    var topicSearch = this.get('model'),
      topicStream = topicSearch.get('topicStream');

    topicStream.forTerm(self.get('term'), {
      without_category: options.without_category || false,
      searchContext: self.get('searchContext'),
      sortContext: {
        sort_order: sortOrder.get('order'),
        sort_descending: sortOrder.get('descending')
      }
    });

    this.set('topicStream', topicStream);
  },

  filterTopics: Discourse.debounce(function() {
    var term = this.get('term');
    if(typeof term == "undefined" || term.length === 0){
      Discourse.URL.replaceState("/topics/search/q/");
      return;
    }

    if(term){
      Discourse.URL.replaceState("/topics/search/q/"+term);
    }

    this.set("searchContext", null);
    return this.searchTopicForTerm();
  }, 250).observes('term'),

  sortOrder: function() {
    return Discourse.SortOrder.create();
  }.property(),

  /**
   If the sort order changes, replace the topics in the list with the new
   order.

   @observes sortOrder
   **/
  _sortOrderChanged: function() {
    return this.searchTopicForTerm({without_category: true});
  }.observes('sortOrder.order', 'sortOrder.descending'),

  /**
   Called the the bottommost visible topics on the page changes.

   @method bottomVisibleChanged
   @params {Discourse.Topic} topic that is at the bottom
   **/
  loadMore: function() {
    var topicStream = this.get('topicStream');
    topicStream.appendMore();
  },

  loadingHTML: function() {
    return "<div class='spinner'>" + I18n.t('loading') + "</div>";
  }.property()

});