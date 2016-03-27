defmodule Rabbit.SubtitleController do
  use Rabbit.Web, :controller
  require Logger
  import Ecto.Query
  alias File, as: EFile
  require Rabbit.File

  def show_subtitle(conn, %{"stream_id" => stream_id} = _params) do
    query = from f in Rabbit.File,
          where: f.url == ^(stream_id),
         select: f
    file = Repo.one!(query)

    filepath = file.vtt_location
    case EFile.stat(filepath) do
      {:ok, file} ->
        EFile.stat(filepath)
        conn
        |> put_resp_content_type("text/vtt")
        |> send_file(200, filepath)
      _ ->
        send_resp(conn, 404, "Not found")
    end
  end
end
