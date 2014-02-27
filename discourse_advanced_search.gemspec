$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "discourse_advanced_search/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "discourse_advanced_search"
  s.version     = DiscourseAdvancedSearch::VERSION
  s.authors     = ["Piotr Szal"]
  s.email       = ["pisz@akra.de"]
  s.summary     = "Advanced search for discourse."
  s.description = "Advanced search for discourse."

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.0.2"
end
