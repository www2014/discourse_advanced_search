Discourse.TopicSearchController = Em.ObjectController.extend(Discourse.Presence, {

  content: [],
  resultCount: false,
  urls: [],
  topics: Em.A(),
  loading: true,
  term: "",
  search_term: "",

  searchTopicForTerm: function(){
    var self = this;
    var searcher = Discourse.SearchTopic.forTerm(self.get('term'), {
      searchContext: self.get('searchContext')
    });
    return searcher.then(function(results) {
      var urls = [];
      if (results) {

        self.set('noResults', typeof results.topics == "undefined" || results.topics.length === 0);

        var index = 0;

        $.each(results.topics, function(item){
          item.index = index++;
          urls.pushObject(item.relative_url);
        });

        self.set('resultCount', index);
        self.set('content', results);
        self.set('urls', urls);
        self.set('topics', self.get_topics_from_search(results));
      }
      self.set('loading', false);
      //}).catch(function() {
      //  self.set('loading', false);
    });
    return searcher;
  },

  filterTopics: Discourse.debounce(function() {
    var search_term = this.get('search_term');
    if(typeof search_term == "undefined"  || search_term.lenght === 0){
      return;
    }
    this.set('term', search_term);
    if(search_term){
      Discourse.URL.replaceState(search_term);
    }
    return this.searchTopicForTerm();
  }, 250).observes('search_term'),

  get_topics_from_search: function(results){
    var topics = Em.A();
    if(results.topics.length === 0){
      return topics;
    }

    results.topics.forEach(function(topic){
      topics.addObject(Discourse.Topic.create(topic));
    });

    return topics;
  }

});