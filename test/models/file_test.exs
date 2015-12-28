defmodule Rabbit.FileTest do
  use Rabbit.ModelCase

  alias Rabbit.File

  @valid_attrs %{content_type: "some content", location: "some content", url: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = File.changeset(%File{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = File.changeset(%File{}, @invalid_attrs)
    refute changeset.valid?
  end
end
