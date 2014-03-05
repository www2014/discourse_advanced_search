require_dependency 'search'

def self.valid_context_types
    %w{category}
  end

class TopicsSearchController < SearchController

  skip_before_filter :check_xhr, only: [:topic_query]

  def topic_query
    params.require(:term)

    search_args = {guardian: guardian}
    search_args[:type_filter] = 'topic'
    search_args[:sort_context] = params[:sort_context] if params[:sort_context]

    # search context
    search_context = params[:search_context]
    if search_context.present?
      raise Discourse::InvalidParameters.new(:search_context) unless SearchController.valid_context_types.include?(search_context[:type])
      raise Discourse::InvalidParameters.new(:search_context) if search_context[:id].blank?

      klass = search_context[:type].classify.constantize

      context_obj = klass.where(id: params[:search_context][:id]).first

      guardian.ensure_can_see!(context_obj)
      search_args[:search_context] = context_obj
    end


    topic_search_view = TopicSearchView.new(params[:term], current_user, search_args.symbolize_keys)


    topic_search_view_serializer = TopicSearchViewSerializer.new(topic_search_view, scope: guardian, root: false)

    respond_to do |format|
      format.html do
        store_preloaded("topic_search", MultiJson.dump(topic_search_view_serializer))
      end
      format.json do
        render_json_dump(topic_search_view_serializer)
      end
    end
  end

end