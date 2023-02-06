#    image: node:18-alpine
#FROM node:18.13.0 as base
#
#WORKDIR /usr/src/app
#
##copy package.json to docker container
#COPY package.json ./
#
#COPY ts*.json ./
##For the database connection
#COPY .env ./
##install package.json dependency
#RUN npm i
##transfer code files
#COPY ./src /usr/src/app/src/
