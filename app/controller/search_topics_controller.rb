require_dependency 'search'

class SearchTopicsController < SearchController

  skip_before_filter :check_xhr, only: [:topic_query, :index]

  def index

  end

  def topic_query
    params.require(:term)

    search_args = {guardian: guardian}
    search_args[:type_filter] = 'topic'

    search = ::TopicSearch.new(params[:term], current_user, search_args.symbolize_keys)

    respond_to do |format|
      format.html do
        store_preloaded("topic_search", MultiJson.dump(search.execute))
      end
      format.json do
        render_json_dump(search.execute.as_json)
      end
    end
  end

end