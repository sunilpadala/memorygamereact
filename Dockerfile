# Use an official Node.js runtime as a parent image
FROM node:16 as build

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the production-ready app
RUN npm run build

# Now use a lightweight web server to serve the React build
FROM nginx:alpine
# Copy build output to Nginx's default html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
