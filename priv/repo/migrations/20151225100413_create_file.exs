defmodule Rabbit.Repo.Migrations.CreateFile do
  use Ecto.Migration

  def change do
    create table(:files) do
      add :url, :string
      add :location, :string
      add :content_type, :string

      timestamps
    end

  end
end
