/**
  Represents a user's stream

  @class TopicStream
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
        existing = topicIdentityMap.get(topic.get('result_post_id'));

      if (existing) {
        // If the topic is in the identity map, update it and return the old reference.
        existing.updateFromTopic(topic);
        return existing;
      }

      topic.set('topicSearch', this.get('topicSearch'));
      topicIdentityMap.set(topic.get('result_post_id'), topic);
    }
    return topic;
  },

  /**
   The last topic we have loaded. Useful for checking to see if we should load more

   @property lastLoadedTopic
   **/
  lastLoadedTopic: function() {
    return _.last(this.get('topics'));
  }.property('topics.@each'),

  /**
   Can we append more topics to our current stream?

   @property canAppendMore
   **/
  canAppendMore: Em.computed.and('notLoading', 'hasTopics', 'lastTopicNotLoaded'),

  /**
   Are we currently loading topics in any way?

   @property loading
   **/
  loading: Em.computed.or('loadingBelow', 'loadingFilter'),

  notLoading: Em.computed.not('loading'),

  /**
   Have we loaded any topics?

   @property hasTopics
   **/
  hasTopics: Em.computed.gt('topics.length', 0),

  lastTopicNotLoaded: Em.computed.not('loadedAllTopics'),

  /**
   Have we loaded the last topic in the stream?

   @property loadedAllTopics
   **/
  loadedAllTopics: function() {
    if (!this.get('hasLoadedData')) { return false; }
    return !!this.get('topics').findProperty('result_post_id', this.get('lastTopicId'));
  }.property('hasLoadedData', 'topics.@each.id', 'lastTopicId'),

  hasLoadedData: Em.computed.and('hasTopics', 'hasStream'),

  /**
   Returns the id of the last topic in the set

   @property lastTopicId
   **/
  lastTopicId: function() {
    return _.last(this.get('stream'));
  }.property('stream.@each'),

  /**
   Do we have a stream list of topic ids?

   @property hasStream
   **/
  hasStream: Em.computed.gt('filteredTopicsCount', 0),

  filteredTopicCount: Em.computed.alias('stream.length'),

  /**
   @private

   Returns the index of a particular user in the stream

   @method indexOf
   @param {Discourse.User} topic The user we're looking for
   **/
  indexOf: function(topic) {
    return this.get('stream').indexOf(topic.get('result_post_id'));
  },

  /**
   @private

   Given a list of topicIds, returns a list of the topics we don't have in our
   identity map and need to load.

   @method listUnloadedIds
   @param {Array} topicIds The topic Ids we want to load from the server
   @returns {Array} the array of topicIds we don't have loaded.
   **/
  listUnloadedIds: function(postIds) {
    var unloaded = Em.A(),
      topicIdentityMap = this.get('topicIdentityMap');
    postIds.forEach(function(post) {
      if (!topicIdentityMap.has(post)) { unloaded.pushObject(post); }
    });
    return unloaded;
  },

  /**
   Returns the window of topics below the current set in the stream, bound by the bottom of the
   stream. This is the collection we use when scrolling downwards.

   @property nextWindow
   **/
  nextWindow: function() {
    // If we can't find the last topic loaded, bail
    var lastLoadedTopic = this.get('lastLoadedTopic');
    if (!lastLoadedTopic) { return []; }

    // Find the index of the last topic loaded, if not found, bail
    var stream = this.get('stream');
    var lastIndex = this.indexOf(lastLoadedTopic);
    if (lastIndex === -1) { return []; }

    // find our window of topics
    return stream.slice(lastIndex+1, lastIndex+Discourse.SiteSettings.posts_per_page+1);
  }.property('lastLoadedTopic', 'stream.@each'),

  /**
   @private

   Returns a list of topics in order requested, by id.

   @method findTopicsByIds
   @param {Array} topicIds The topic Ids we want to retrieve, in order.
   @returns {Ember.Deferred} a promise that will resolve to the topics in the order requested.
   **/
  findTopicsByPostIds: function(postIds) {
    var unloaded = this.listUnloadedIds(postIds),
      topicIdentityMap = this.get('topicIdentityMap');

    // Load our unloaded topic by id
    return this.loadIntoIdentityMap(unloaded).then(function() {
      return postIds.map(function (post) {
        return topicIdentityMap.get(post);
      });
    });
  },

  /**
   @private

   Loads a list of topics from the server and inserts them into our identity map.

   @method loadIntoIdentityMap
   @param {Array} topicIds The topic Ids we want to insert into the identity map.
   @returns {Ember.Deferred} a promise that will resolve to the users in the order requested.
   **/
  loadIntoIdentityMap: function(postIds) {

    // If we don't want any topics, return a promise that resolves right away
    if (Em.isEmpty(postIds)) {
      return Ember.Deferred.promise(function (p) { p.resolve(); });
    }

    var url = "/topics/search/posts.json",
      data = { post_ids: postIds },
      topicStream = this;

    return Discourse.ajax(url, {data: data}).then(function(result) {
      var topics = Em.get(result, "topic_stream.topics");
      if (topics) {
        topics.forEach(function (topic) {
          topicStream.storeTopic(Discourse.Topic.create(topic));
        });
      }
    });
  },

  /**
   Appends the next window of topics to the stream. Call it when scrolling downwards.

   @method appendMore
   @returns {Ember.Deferred} a promise that's resolved when the topics have been added.
   **/
  appendMore: function() {
    var self = this;

    // Make sure we can append more topics
    if (!self.get('canAppendMore')) { return Ember.RSVP.resolve(); }

    var postIds = self.get('nextWindow');
    if (Ember.isEmpty(postIds)) { return Ember.RSVP.resolve(); }

    self.set('loadingBelow', true);

    var stopLoading = function() {
      self.set('loadingBelow', false);
    };

    return self.findTopicsByPostIds(postIds).then(function(topics) {
      topics.forEach(function(topic) {
        self.appendTopic(topic);
      });
      stopLoading();
    }, stopLoading);
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