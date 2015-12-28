defmodule Rabbit.PageController do
  use Rabbit.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
