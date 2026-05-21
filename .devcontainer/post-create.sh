#!/bin/bash
set -e

echo "Installing Task..."
sudo sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

echo "Verifying Task installation..."
task --version

echo "Development environment setup complete!"
