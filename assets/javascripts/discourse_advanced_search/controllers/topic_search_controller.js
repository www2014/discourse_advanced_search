Discourse.TopicSearchController = Em.ObjectController.extend(Discourse.Presence, {

  needs: "search",
  term: Em.computed.alias("controllers.search.term"),

  content: [],
  resultCount: false,
  urls: [],
  topics: Em.A(),
  loading: true,

  searchTopicForTerm: function(){
    var self = this;
    var searcher = Discourse.SearchTopic.forTerm(self.get('term'), {
      searchContext: self.get('searchContext')
    });
    return searcher.then(function(results) {

      var urls = [];
      if (results) {
        var topicView = results.topic_search_view;
        self.set('noResults', typeof topicView.topics == "undefined" || topicView.topics.length === 0);

        var index = 0;

        $.each(topicView.topics, function(item){
          item.index = index++;
          urls.pushObject(item.relative_url);
        });

        self.set('resultCount', index);
        self.set('content', results);
        self.set('urls', urls);
        self.set('topics', self.get_topics_from_search(topicView));
      }
      self.set('loading', false);
      //}).catch(function() {
      //  self.set('loading', false);
    });
    return searcher;
  },

  filterTopics: Discourse.debounce(function() {
    var term = this.get('term');
    if(typeof term == "undefined"  || term.lenght === 0){
      return;
    }

    if(term){
      Discourse.URL.replaceState(term);
    }
    return this.searchTopicForTerm();
  }, 250).observes('term'),

  get_topics_from_search: function(topicView){
    var topics = Em.A();
    if(topicView.topics.length === 0){
      return topics;
    }

    topicView.topics.forEach(function(topic){
      topics.addObject(Discourse.Topic.create(topic));
    });

    return topics;
  }

});