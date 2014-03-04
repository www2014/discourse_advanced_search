# name: discourse_advanced_search
# about: discourse_advanced_search
# version: 0.0.1
# authors: Piotr Szal

# load the engine definition, which is in a separate file so that script/rails can use it
require File.expand_path('../lib/discourse_advanced_search/engine', __FILE__)

register_asset('javascripts/discourse_advanced_search.js', :server_side)
register_asset('stylesheets/discourse_advanced_search.css')

