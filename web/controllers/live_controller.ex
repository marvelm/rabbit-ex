defmodule Rabbit.LiveController do
  use Rabbit.Web, :controller

  def show_live(conn, _params) do
    render conn, "live.html"
  end
end
