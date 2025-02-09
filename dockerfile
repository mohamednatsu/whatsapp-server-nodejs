FROM node:18

# Install the required dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libx11-xcb1 \
    libgdk-pixbuf2.0-0 \
    libpango1.0-0 \
    libxss1

# Your other Dockerfile setup
WORKDIR /app
COPY . .
RUN npm install
