# Rabbit

Rabbit synchronizes videos between partners

To start:

  1. Install dependencies with `mix deps.get && npm install`
  2. Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  3. Start Phoenix endpoint with `mix phoenix.server`

Now you can visit [`localhost:4000/files`](http://localhost:4000/files) from your browser.
Add a video of your choosing by clicking on the "New file" link on the bottom.


The `Url` field refers to the url at which you wish to view the video with a partner.
For example, "example" would result in a video being streamed at "http://localhost:4000/video/example"


The `Location` field refers to the location of the video file on the disk.


The `Content type` can be one of two strings `video/webm` and `video/mp4.`

## Deployment
You will need `unzip`, `gcc` (for compiling the Sqlite driver), `erlang`, and `elixir` to be able to deploy.

Execute the following commands to download Rabbit into a folder called 'rabbit'.
```
wget https://github.com/marvelm/rabbit-ex/archive/master.zip
unzip master.zip
rm master.zip
mv rabbit-ex-master rabbit
cd rabbit
```

Compile the assets and project and generate the Sqlite database.
```
npm install
mix deps.get
brunch build --production
MIX_ENV=prod mix phoenix.digest
MIX_ENV=prod mix ecto.migrate
```

Now you need to configure the secret key. Execute `mix phoenix.gen.secret` in the `rabbit` directory to obtain a secret.
Place the result in the `secret_key_base` field in `config/prod.secret.exs`


To finally run the server:
```
PORT=80 MIX_ENV=prod mix phoenix.server
```
