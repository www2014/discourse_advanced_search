/**
 A data model representing a Topic Search

 @class TopicSearch
 @extends Discourse.Model
 @namespace Discourse
 @module Discourse
 **/
Discourse.TopicSearch = Discourse.Model.extend({

  query: null,

  topicStream: function() {
    return Discourse.TopicStream.create({topicSearch: this});
  }.property(),

  // Update our attributes from a JSON result
  updateFromJson: function(json) {

    var keys = Object.keys(json);
    keys.removeObject('topic_stream');

    var topicSearch = this;
    keys.forEach(function (key) {
      topicSearch.set(key, json[key]);
    });

  }
});