/**
 Produces a search link to a topic

 @method topicSearchLink
 @for Handlebars
 **/
Handlebars.registerHelper('topicSearchLink', function(property, options) {
  var topic = Ember.Handlebars.get(this, property, options),
    title = topic.get('fancy_title') || topic.get('title');
  return "<a href='" + topic.get('relative_url') + "' class='title'>" + title + "</a>";
});

Handlebars.registerHelper('categorySearchLink', function(property, options) {
  var category = this;
  var action = Ember.Handlebars.helpers.action.apply(this, arguments);
  return new Handlebars.SafeString("<li class=\"search-category\" style=\"color: white; background-color: #"+category.color+"\""+new Ember.Handlebars.SafeString(action)+">"+category.get("name")+"</li>");
});