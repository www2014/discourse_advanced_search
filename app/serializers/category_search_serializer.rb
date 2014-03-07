class CategorySearchSerializer < BasicCategorySerializer
  attributes :subcategory_ids,
             :is_uncategorized

  def is_uncategorized
    object.id == SiteSetting.uncategorized_category_id
  end

  def include_subcategory_ids?
    subcategory_ids.present?
  end
end