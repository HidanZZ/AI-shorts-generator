# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Install necessary utilities
RUN apt-get update && apt-get install -y wget gnupg2 apt-transport-https ca-certificates

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - 
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -y google-chrome-stable

# Install other necessary software
RUN apt-get install -y redis-server ffmpeg

# Install Python, pip and edge-tts
RUN apt-get install -y python3 python3-pip && pip3 install edge-tts

# Set up the AI model
RUN npx nodejs-whisper download

# Run the server
CMD [ "npm", "run", "dev" ]
