defmodule Rabbit.HangoutController do
  use Rabbit.Web, :controller

  def show(conn, %{"stream_id" => stream_id}) do
    render conn, "hangout.html", stream_id: stream_id
  end
end
