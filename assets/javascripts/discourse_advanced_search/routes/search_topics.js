Discourse.SearchTopicsRoute = Discourse.Route.extend({

  setupController: function(params) {

    var search_controller = this.controllerFor('search'),
      term = search_controller.get('term');
    var controller = this.controllerFor('topic_search');
    controller.set('term', term);

    controller.searchTopicForTerm();
  },

  renderTemplate: function() {
    var controller = this.controllerFor('topic_search');
    this.render('discourse_advanced_search/templates/topic_search', {
      controller: controller
    });
  }
});