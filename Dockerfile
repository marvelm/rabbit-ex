FROM bitwalker/alpine-elixir-phoenix:latest

RUN apk --no-cache add sqlite

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN mkdir -p /app/data/

ENV MIX_ENV=prod

RUN npm install -g brunch
RUN mix local.hex --force

RUN mix deps.get --only prod
RUN mix compile
RUN brunch build --production
RUN mix phoenix.digest

ENV PORT 4000
CMD mix ecto.migrate && mix phoenix.server
