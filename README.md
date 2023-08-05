# Project Name

## Table of Contents

- [Introduction](#introduction)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
  - [Linux Environment](#linux-environment)
  - [Installing Dependencies](#installing-dependencies)
  - [Running Redis](#running-redis)
  - [Setting Up Environment Variables](#setting-up-environment-variables)
  - [Running the Backend](#running-the-backend)

## Introduction

(Provide a brief introduction about your project here)

## Frontend Setup

1. Navigate to the `front` directory.
   ```bash
   cd front
   ```
2. Install the required dependencies.
   ```bash
   npm install
   ```
3. Start the development server.
   ```bash
   npm run dev
   ```

The frontend is now up and running!

## Backend Setup

### Linux Environment

The backend requires a Linux environment due to certain C++ dependencies. For Windows users, Windows Subsystem for Linux 2 (WSL2) is recommended.

### Installing Dependencies

1. Navigate to the `back` directory.
   ```bash
   cd back
   ```
2. Install Redis and ffmpeg. Here's a simple command for Ubuntu.
   ```bash
   sudo apt update
   sudo apt install redis-server ffmpeg
   ```
3. Install edge-tts dependencies. you will need to have python and pip installed. Here's a simple command for Ubuntu.
   ```bash
   pip install edge-tts
   ```
4. install whisper for transcription. Here's a simple command for Ubuntu.
   ```bash
   pip3 install --upgrade  --force-reinstall git+https://github.com/linto-ai/whisper-timestamped
   ```
5. install Google Chrome for puppetee if not already installed. Here's a simple command for Ubuntu.

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

sudo dpkg -i google-chrome-stable_current_amd64.deb

sudo rm google-chrome-stable_current_amd64.deb
```

If you face any dependency issues, you can resolve them by running:

```bash
sudo apt-get install -f
```

6. Install the necessary Node.js dependencies.
   ```bash
   npm install
   ```

### Running Redis

After installing Redis, run it by executing the following command:

```bash
sudo service redis-server start
```

### Running the Backend

Start the backend server.

```bash
npm run dev
```

The backend server should now be running successfully!

For any issues, please raise a ticket in the Issues section of this repository.
