defmodule Rabbit.Repo.Migrations.AddVttFieldToFiles do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :vtt_location, :string
    end
  end
end
