defmodule Rabbit.SeriesController do
	use Rabbit.Web, :controller

  alias Elixir.File, as: EFile
  require Rabbit.File

  def index(conn, _params) do
    render(conn, "series.html")
  end

  defp add_files(directory, prefix, content_type) do
    suffix = case content_type do
               "video/webm" -> [".mkv", ".webm"]
               "video/mp4"  -> ".mp4"
             end

    video_files = EFile.ls!(directory) |>
      Enum.filter(&(String.ends_with?(&1, suffix))) |>
      Enum.sort

    for {i, f} <- Enum.zip(1..Enum.count(video_files), video_files) do
      file = %Rabbit.File {
        url: "#{prefix}#{i}",
        location: "#{directory}/#{f}",
        content_type: content_type,
        vtt_location: ""
      }
      Repo.insert!(file)
    end
  end

  def submit(conn, %{ "series" =>
                      %{"directory" => directory,
                        "prefix" => prefix,
                         "content_type" => content_type}}) do
    conn =
      try do
        add_files(directory, prefix, content_type)
        put_flash(:info, "Series added successfully")
      rescue
        e -> put_flash(:error, e.message)
      end

    render(conn, "series.html")
  end
end
