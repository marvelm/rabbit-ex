defmodule Rabbit.VideoController do
  use Rabbit.Web, :controller

  def show_video(conn, %{"stream_id" => stream_id} = _params) do
    render conn, "video.html", stream_id: stream_id
  end
end
