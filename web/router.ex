defmodule Rabbit.Router do
  use Rabbit.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Rabbit do
    pipe_through :browser # Use the default browser stack

    get "/",                  PageController ,  :index
    get "/stream/:stream_id", StreamController, :show_stream
    get "/video/:stream_id" , VideoController,  :show_video

    resources "/files", FileController
  end

  # Other scopes may use custom stacks.
  # scope "/api", Rabbit do
  #   pipe_through :api
  # end
end
