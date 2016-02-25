rm rabbit_dev
mix ecto.migrate
mix compile
mix phoenix.server & pid=$!
sleep 10
mocha --harmony --no-timeouts
kill $pid
