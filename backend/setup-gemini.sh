#!/bin/bash

# Script to add Gemini API key to .env file

GEMINI_API_KEY="AIzaSyCBiLxV7d2605jDNMMsE2ONg4A9aUN9mNM"
ENV_FILE=".env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    touch "$ENV_FILE"
fi

# Check if GEMINI_API_KEY already exists
if grep -q "GEMINI_API_KEY" "$ENV_FILE"; then
    echo "Updating existing GEMINI_API_KEY..."
    # Remove old key line
    sed -i.bak "/^GEMINI_API_KEY=/d" "$ENV_FILE"
fi

# Add the API key
echo "" >> "$ENV_FILE"
echo "# Gemini AI API Key" >> "$ENV_FILE"
echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> "$ENV_FILE"

echo "✅ Gemini API key has been added to $ENV_FILE"
echo "Please restart your backend server for changes to take effect."

