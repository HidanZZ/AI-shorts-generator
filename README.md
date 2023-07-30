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
3. Download and set up the required AI model.
   ```bash
   chmod +x models/download-models.sh
   ./models/download-models.sh
   ```
4. Install the necessary Node.js dependencies.
   ```bash
   npm install
   ```

### Running Redis

After installing Redis, run it by executing the following command:

```bash
sudo service redis-server start
```

### Setting Up Environment Variables

Modify the `MODEL_PATH` in the `.env` file to match the path of the downloaded AI model.

### Running the Backend

Start the backend server.

```bash
npm run dev
```

The backend server should now be running successfully!

For any issues, please raise a ticket in the Issues section of this repository.
