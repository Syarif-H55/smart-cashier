# Use Nginx as the web server for serving frontend files
FROM nginx:alpine

# Copy the frontend files to Nginx web directory
COPY public/ /usr/share/nginx/html/

# Expose port 80 for HTTP traffic (will be mapped to 8080 via docker-compose)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]