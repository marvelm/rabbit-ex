# Rabbit

Rabbit synchronizes videos between partners

To start:

  1. Install dependencies with `mix deps.get && npm install`
  2. Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  3. Start Phoenix endpoint with `mix phoenix.server`

Now you can visit [`localhost:4000/files`](http://localhost:4000/files) from your browser.
Add a video of your choosing by clicking on the "New file" link on the bottom.


 - The `Url` field refers to the url at which you wish to view the video with a partner.
For example, "example" would result in a video being streamed at "http://localhost:4000/video/example"
 - The `Location` field refers to the location of the video file on the disk.
 - The `Content type` can be one of two strings `video/webm` and `video/mp4.`

If you've added a video with the `Url` "example", you and your partner
can go to "http://localhost:4000/video/example". If you scroll down, you'll see the
controls for Rabbit.

## Deployment
You will need `wget` `unzip`, `gcc` (for compiling the Sqlite driver), `erlang`, and `elixir` to be able to deploy.

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
You also need to specify the host (or IP address) of your server in `config/prod.exs`
on line 21.


To finally run the server:
```
PORT=80 MIX_ENV=prod mix phoenix.server
```

## Update
To update run the following script in the parent directory of rabbit. It will download
the latest source files, keep your config, and migrate the database.

```
wget https://github.com/marvelm/rabbit-ex/archive/master.zip
unzip master.zip
rm master.zip
mv rabbit-ex-master rabbit-new
cp rabbit/rabbit_prod rabbit-new
rm -rf rabbit-new/config
cp -r rabbit/config rabbit-new
cp -r rabbit/.env rabbit-new
cp -r rabbit/run.sh rabbit-new
mv rabbit rabbit_backup

mv rabbit-new rabbit
cd rabbit
npm install
mix deps.get
brunch build --production
source .env
MIX_ENV=prod mix compile
MIX_ENV=prod mix phoenix.digest
MIX_ENV=prod mix ecto.migrate
```

## Notes

Check out the `hangout` branch to try the video chat feature
