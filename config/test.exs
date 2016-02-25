use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :rabbit, Rabbit.Endpoint,
  http: [port: 4001],
  server: true

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :rabbit, Rabbit.Repo,
  adapter: Sqlite.Ecto,
  database: "rabbit_test",
  pool: Ecto.Adapters.SQL.Sandbox
