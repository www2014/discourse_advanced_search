Discourse.TopicsSearchRoute = Discourse.Route.extend({

  model: function(){
    var controller = this.controllerFor('topic_search'),
      term = controller.get('term');
    if(typeof term != "undefined"){
      Discourse.URL.replaceState("/topics/search/q/"+term);
    }

    return Discourse.TopicSearch.create();
  },

  actions: {
    search_category: function (category) {

      var controller = this.controllerFor('topic_search');

      controller.activeMainCategory(category);

      controller.set("searchContext", {type: "category", id: category.id});
      controller.searchTopicForTerm({without_category: true});

    }
  },

  setupController: function(controller, model) {
    var controller = this.controllerFor('topic_search');
    controller.set('model', model);    

    controller.searchTopicForTerm();
  },

  renderTemplate: function() {
    var controller = this.controllerFor('topic_search');
    this.render('discourse_advanced_search/templates/topic_search', {
      controller: controller
    });
  }
});