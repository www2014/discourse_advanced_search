module DiscourseAdvancedSearch
  class Engine < ::Rails::Engine
    config.autoload_paths << File.expand_path("../../../lib", __FILE__)
    isolate_namespace DiscourseAdvancedSearch
  end
end
