Discourse.TopicSearchListItemView = Discourse.TopicListItemView.extend(Discourse.LoadMore, {
  templateName: 'discourse_advanced_search/templates/topic_search_list_item',

  eyelineSelector: '.topic-list-item',

  actions: {
    loadMore: function() {
      this.get('controller.parentController').loadMore();
    }
  }
});