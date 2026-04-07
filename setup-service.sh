#!/bin/bash

# Define variables
SERVICE_NAME="job-tracker"
SERVICE_FILE="$HOME/.config/systemd/user/$SERVICE_NAME.service"
PROJECT_DIR="/home/basith/Desktop/Job Tracker"
Description="Job Tracker PWA Service"

# Ensure the systemd user directory exists
mkdir -p "$HOME/.config/systemd/user"

# Create the service file
echo "Creating systemd service file at $SERVICE_FILE..."
cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=$Description
After=network.target

[Service]
Type=simple
WorkingDirectory=$PROJECT_DIR
ExecStart=/bin/bash -c 'npm run dev -- --port 3333 --host'
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

# Reload systemd to recognize the new service
echo "Reloading systemd daemon..."
systemctl --user daemon-reload

# Enable the service to start on login
echo "Enabling service to start on login..."
systemctl --user enable $SERVICE_NAME

# Start the service immediately
echo "Starting service..."
systemctl --user restart $SERVICE_NAME

# Check status
echo "Service status:"
systemctl --user status $SERVICE_NAME --no-pager

echo "Setup complete! App should be running on http://localhost:3333"
