use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
config :rabbit, Rabbit.Endpoint,
  # set your own. at least 64
  secret_key_base: "v2H26XT/+x9HUlXGw+aJrcYj3b1bwdnhIgt6dFi9ZtZG7c1hnB9TzYxjFHoovVb6"

# Configure your database
config :rabbit, Rabbit.Repo,
  adapter: Sqlite.Ecto,
  database: "data/rabbit_prod",
  pool_size: 20
