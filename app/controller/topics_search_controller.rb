require_dependency 'search'

class TopicsSearchController < SearchController

  skip_before_filter :check_xhr, only: [:topic_query]

  def topic_query
    params.require(:term)

    search_args = {guardian: guardian}
    search_args[:type_filter] = 'topic'
    search_args[:sort_context] = params[:sort_context] if params[:sort_context]

    search = TopicSearchView.new(params[:term], search_args.symbolize_keys)

    topic_list = TopicList.new(:latest, current_user, search.execute)

    topic_search_view_serializer = TopicSearchViewSerializer.new(topic_list, scope: guardian)

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