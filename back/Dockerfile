# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Install necessary utilities
RUN apt-get update && apt-get install -y wget gnupg2 apt-transport-https ca-certificates python3-full python3-venv

# Create a Python virtual environment and upgrade pip
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN /opt/venv/bin/python -m pip install --upgrade pip

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - 
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -y google-chrome-stable

# Install other necessary software
RUN apt-get install -y redis-server ffmpeg

# Install edge-tts in the virtual environment
RUN pip install edge-tts

# Install whisper-timestamped in the virtual environment
RUN pip install --upgrade --no-deps --force-reinstall git+https://github.com/linto-ai/whisper-timestamped

# Run the server
CMD sh -c "npm run build && npm run start"

