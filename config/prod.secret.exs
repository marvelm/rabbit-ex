# This should be in `data/prod.secret.exs`
use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
config :rabbit, Rabbit.Endpoint,
  http: [port: 4000],
  # https: [port: 443,
  #         keyfile: "/absolute/path/to/server.key",
  #         certfile: "/absolute/path/to/server.crt",
  #         cacertfile: "THIS IS OPTIONAL. /absolute/path/to/ca.crt"
  #       ]

  # The port maybe different if you're processing requests through
  # a reverse proxy
  url: [host: "example.com", port: 4000],

  # set your own. at least 64
  secret_key_base: "v2H26XT/+x9HUlXGw+aJrcYj3b1bwdnhIgt6dFi9ZtZG7c1hnB9TzYxjFHoovVb6"

# Configure your database
config :rabbit, Rabbit.Repo,
  adapter: Sqlite.Ecto,
  database: "data/rabbit_prod",
  pool_size: 20
