class TopicSearchViewSerializer < ApplicationSerializer
  include TopicStreamSerializerMixin

  attributes :categories

	def categories
	  return @categories if @categories.present?
	  @categories = []
	  if object.categories
	    object.categories.each do |category|
	      serialized_categories = CategorySearchSerializer.new(category, scope: object.guardian, root: false)

	      @categories << serialized_categories.as_json
	    end
	  end
	  @categories
	end
  #has_many :categories, serializer: CategoryDetailedSerializer, embed: :objects
end


