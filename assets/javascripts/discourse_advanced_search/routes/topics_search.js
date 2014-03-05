Discourse.TopicsSearchRoute = Discourse.Route.extend({

  actions: {
    search_category: function (category) {
      var controller = this.controllerFor('topic_search');
      controller.set("searchContext", {type: "category", id: category.id});
      controller.searchTopicForTerm();
    }
  },

  
  setupController: function() {
    var controller = this.controllerFor('topic_search');

    controller.searchTopicForTerm();
  },

  renderTemplate: function() {
    var controller = this.controllerFor('topic_search');
    this.render('discourse_advanced_search/templates/topic_search', {
      controller: controller
    });
  }
});