Discourse.SearchTopic = {

  forTerm: function(term, opts){

    if (!opts) opts = {};

    var data = {};

    if (opts.searchContext) {
      data.search_context = {
        type: opts.searchContext.type,
        id: opts.searchContext.id,
        type_filter: 'topic'
      };
    }
    if (opts.sortContext) {
      data.sort_context = {
        sort_order: opts.sortContext.sort_order,
        sort_descending: opts.sortContext.sort_descending
      }
    }

    return PreloadStore.getAndRemove("topic_search", function() {
      if(typeof term == "undefined" || term.length === 0){
        return [];
      }
      return Discourse.ajax('/topics/search/q/'+ term, { data: data });
    });
  }

};