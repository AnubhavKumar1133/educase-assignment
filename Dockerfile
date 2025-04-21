# Use an official node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json .

# Install the dependencies
RUN npm install

# Copy the rest of the application code into the container at /app
COPY . .
RUN npx prisma generate

# Expose port that the app runs on
EXPOSE 5000

# Define the command to run the application
CMD ["node", "./src/server.js"]
