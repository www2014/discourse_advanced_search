require_dependency 'search'

class SearchTopicsController < SearchController

  skip_before_filter :check_xhr, only: [:query, :index]

  def omdex

  end

  def query
    pp '##########'
  end

end