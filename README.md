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
### Docker
You should modify the `secret_key_base` in `config/prod.secret.exs` before
building.

```bash
docker build -t rabbit --rm .
mkdir -p data/media
docker run -p 80:4000 -v $PWD/data:/app/data rabbit
```
