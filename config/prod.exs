use Mix.Config

config :rabbit, Rabbit.Endpoint,
  cache_static_manifest: "priv/static/manifest.json"

# Do not print debug messages in production
config :logger, level: :info

config :rabbit, Rabbit.Repo, [
  adapter: Sqlite.Ecto,
  database: "data/rabbit_prod",
  pool_size: 20
]

# Finally import the config/prod.secret.exs
# which should be versioned separately.
import "prod.secret.exs"
