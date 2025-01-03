# Use the official Node.js 18 image as a base for building the app
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build


# Use the official Nginx image to serve the app
FROM nginx:alpine

# Install envsubst (part of the gettext package)
RUN apk --no-cache add gettext

# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

ADD default.conf.template /etc/nginx/conf.d/default.conf.template

# Expose the port Nginx will listen on
EXPOSE 80

# Use envsubst to replace environment variables in the nginx.conf template, then
# start the nginx server
ENTRYPOINT ["/bin/sh", "-c", "envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
