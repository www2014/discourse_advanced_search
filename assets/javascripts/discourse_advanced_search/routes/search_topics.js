Discourse.SearchTopicsRoute = Discourse.Route.extend({

  setupController: function(controller, model) {
    var controller = this.controllerFor('search');

    controller.searchTopicForTerm();
  },

  renderTemplate: function() {
    var controller = this.controllerFor('search');
    this.render('templates/topic_search', {
      controller: controller
    });
  }
});