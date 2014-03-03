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

    return PreloadStore.getAndRemove("topic_search", function() {
      if(typeof term == "undefined" || term.length === 0){
        return [];
      }
      return Discourse.ajax('/search/topics/q/'+ term, { data: data });
    });
  }

};