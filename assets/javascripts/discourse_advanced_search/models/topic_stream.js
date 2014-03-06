/**
  Represents a user's stream

  @class UserStream
  @extends Discourse.Model
  @namespace Discourse
  @module Discourse
**/
Discourse.TopicStream = Discourse.Model.extend({
  loaded: false,

  forTerm: function(term, opts){
    self = this;


    // TODO: if we have all the users in the filter, don't go to the server for them.
    self.set('loadingFilter', true);

    var topicSearch = this.get('topicSearch');

    return Discourse.TopicStream.loadTopicSearchView(term, opts).then(function (json) {
      topicSearch.updateFromJson(json);
      self.updateTopicsFromJson(json.topic_stream);
      self.updateCategoriesFromJson(json.categories);
      self.setProperties({ loadingFilter: false, loaded: true });
      //Discourse.URL.set('queryParams', self.get('streamFilters'));
    });
  },

  /**
   @private

   Given a JSON packet, update this stream and the topic that exist in it.

   @param {Object} topicStreamData The JSON data we want to update from.
   @method updateFromJson
   **/
  updateTopicsFromJson: function(topicStreamData) {
    var topicStream = this,
      topics = this.get('topics');

    topics.clear();
    if (topicStreamData) {
      // Load topics if present
      topicStreamData.topics.forEach(function(topic) {
        topicStream.appendTopic(Discourse.Topic.create(topic));
      });
      delete topicStreamData.topics;

      // Update our attributes
      topicStream.setProperties(topicStreamData);
    }
  },


  updateCategoriesFromJson: function(categoriesData) {

    var topicStream = this,
      categories = this.get('categories');

    categories.clear();

    if (categoriesData) {
      // Load categories if present
      categoriesData.forEach(function(category) {
        topicStream.appendCategory(Discourse.Category.create(category));
      });
      delete categoriesData;

      // Update our attributes
      //topicStream.setProperties(topicStreamData);
    }
  },

  /**
   Appends a single topic into the stream.

   @method appendTopic
   @param {Discourse.Topic} topic The topic we're appending
   @returns {Discourse.Topic} the topic that was inserted.
   **/
  appendTopic: function(topic) {
    this.get('topics').addObject(this.storeTopic(topic));
    return topic;
  },
  appendCategory: function(category) {
    this.get('categories').addObject(category);
    return category;
  },
  /**
   @private

   Stores a topic in our identity map, and sets up the references it needs to
   find associated objects like the topic. It might return a different reference
   than you supplied if the user has already been loaded.

   @method storeTopic
   @param {Discourse.Topic} user The topic we're storing in the identity map
   @returns {Discourse.Topic} the topic from the identity map
   **/
  storeTopic: function(topic) {
    var topicId = topic.get('id');
    if (topicId) {
      var topicIdentityMap = this.get('topicIdentityMap'),
        existing = topicIdentityMap.get(topic.get('id'));

      if (existing) {
        // If the topic is in the identity map, update it and return the old reference.
        existing.updateFromTopic(topic);
        return existing;
      }

      topic.set('topicSearch', this.get('topicSearch'));
      topicIdentityMap.set(topic.get('id'), topic);
    }
    return topic;
  }

});

Discourse.TopicStream.reopenClass({

  init: function() {
    this.setProperties({ itemsLoaded: 0, content: [] });
  },

  create: function() {
    var topicStream = this._super.apply(this, arguments);
    topicStream.setProperties({
      topics: Em.A(),
      categories: Em.A(),
      stream: Em.A(),
      topicIdentityMap: Em.Map.create(),
      summary: false,
      loaded: false,
      loadingBelow: false,
      loadingFilter: false
    });
    return topicStream;
  },


  loadTopicSearchView: function(term, opts){

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

});