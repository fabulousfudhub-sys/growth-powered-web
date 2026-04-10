# Docker Building and Config

# Building Image
docker-compose build --no-cache



# Building Container
docker compose up -d
docker-compose up -d --build

# Dropping Container
docker compose down -v

# Building image but before build image u must change the DockerFile to copy schema; The commented

<!-- FROM postgres:15
COPY db/schema.sql /docker-entrypoint-initdb.d/ -->

docker build -t cbt_app .
docker save atapoly-db -o db.tar  

# Saving Image
docker save backend-cbt_app:latest -o cbt_app.tar
docker save atapoly-db:latest -o db.tar
docker save postgres:15 -o postgres.tar

# Loading Existing 
docker load -i cbt_app.tar
docker load -i db.tar
docker load -i postgres.tar

# Running Containers
docker run -d --name db backend-db:latest
docker run -d --name cbt_app -p 3000:3000 backend-cbt_app:latest

  