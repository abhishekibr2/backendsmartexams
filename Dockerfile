# Use an official Node.js runtime as a parent image for the backend
FROM node:18

# Set the working directory in the container for the backend
WORKDIR /app

# Copy package.json and package-lock.json for the backend
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of your backend code to the container
COPY . .

# Expose the port that your backend application listens on
EXPOSE 3001

# Define the command to start your backend
CMD ["npm", "start"]