<p align="center">
  <img src="./app/assets/icon.svg" height="40" />
</p>

<h1 align="center">clipkit</h1>
<p align="center">a video sharing website</p>

![preview of the website, showing the main dashboard, the video page and a discord preview](./art/banner.webp)

## stack

- React Router v7
- PostgreSQL
- S3-compatible storage
- ffmpeg
- Docker

## how to deploy with Docker

- see example [docker-compose.yml](./docker-compose.yml)
- you have to provide your own ffmpeg build. for example: https://johnvansickle.com/ffmpeg/
- for now, migrations have to be done manually, but i plan on adding a migration script.