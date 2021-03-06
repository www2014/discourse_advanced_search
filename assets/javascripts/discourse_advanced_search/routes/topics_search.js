Discourse.TopicsSearchRoute = Discourse.Route.extend({

  model: function(params){
    return Discourse.TopicSearch.create({query: params.query});
  },

  actions: {
    search_category: function (category) {
      var controller = this.controllerFor('topic_search');
      if (category.get("selected")) {
        controller.set("searchContext", false);
      }
      else {
        controller.set("searchContext", {type: "category", id: category.id});
      }
      controller.activeMainCategory(category);
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