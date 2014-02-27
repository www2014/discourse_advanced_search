Discourse.SearchTopicsRoute = Discourse.Route.extend({

  setupController: function(controller, model) {
    var controller = this.controllerFor('search');

    controller.searchTopicForTerm();
  }
});