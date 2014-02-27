Discourse.SearchTopicsRoute = Discourse.Route.extend({

  setupController: function(controller, model) {
    var controller = this.controllerFor('search');

    controller.searchTopicForTerm();
  },

  renderTemplate: function() {
    var controller = this.controllerFor('search');
    this.render('discourse_advanced_search/templates/topic_search', {
      controller: controller
    });
  }
});