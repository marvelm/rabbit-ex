defmodule Rabbit.StreamController do
  use Rabbit.Web, :controller
  require Logger
  import Ecto.Query
  alias File, as: EFile
  require Rabbit.File

  def show_stream(conn, %{"stream_id" => stream_id} = _params) do
    query = from f in Rabbit.File,
          where: f.url == ^(stream_id),
         select: f

    file = Repo.one!(query)
    filepath = file.location
    content_type = file.content_type

    # filepath = "/Users/z/Downloads/4FNZ.webm"
    # content_type = "video/webm"
    {:ok, file} = EFile.stat(filepath)

    range = get_req_header(conn, "range")
    {start, end_} =
      if Enum.empty?(range) do
        {0, file.size - 1}
      else
        range = hd range
        [start, end_] = range
          |> String.slice(6, String.length(range))
          |> String.split("-")

        end_ = case end_ do
          "" -> file.size - 2
          end_ -> String.to_integer(end_)
        end

        {String.to_integer(start), end_}
      end

    content_length = end_ - start + 2

    conn
      |> put_resp_content_type(content_type)
      |> put_resp_header("content-length", Integer.to_string(content_length))
      |> put_resp_header("accept-ranges", "bytes")
      # |> put_resp_header("content-disposition", ~s(inline; filename="#{filename}"))
      |> put_resp_header("content-range", "bytes #{start}-#{end_}/#{file.size}")
      |> send_file(206, filepath, start, content_length)
  end
end
