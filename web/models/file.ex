defmodule Rabbit.File do
  use Rabbit.Web, :model

  schema "files" do
    field :url, :string
    field :location, :string
    field :content_type, :string
    field :vtt_location, :string

    timestamps
  end

  @required_fields ~w(url location content_type)
  @optional_fields ~w(vtt_location)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
