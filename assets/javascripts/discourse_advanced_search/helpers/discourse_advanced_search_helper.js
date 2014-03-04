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
	var category = Ember.Handlebars.get(this, property, options);
	if (!(category.get("parent_category_id"))) {
		return new Handlebars.SafeString("<li class=\"badge-category\" style=\"color: white; background-color: #"+category.color+"\">"+category.get("name")+"</li>");	
	}
});