(function() {
  window.Discourse.Topic.reopen({

    updateFromTopic: function(otherTopic){
      var topic = this;
      Object.keys(otherTopic).forEach(function (key) {
        var value = otherTopic[key];
        if (typeof value !== "function") {
          topic.set(key, value);
        }
      });
    }

  });
}).call(this);