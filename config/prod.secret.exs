use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
config :rabbit, Rabbit.Endpoint,
  # set your own. at least 64
  secret_key_base: ""

# Configure your database
config :rabbit, Rabbit.Repo,
  adapter: Sqlite.Ecto,
  database: "rabbit_prod",
  pool_size: 20
