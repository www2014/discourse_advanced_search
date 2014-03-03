Discourse.SearchTopicsRoute = Discourse.Route.extend({

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