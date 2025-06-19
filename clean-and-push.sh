#!/bin/bash

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy all files except .git directory and cleaning scripts
echo "Copying files to temporary directory..."
rsync -a --exclude=".git" --exclude="clean-*.sh" . "$TEMP_DIR/"

# Initialize a new git repository in the temporary directory
echo "Initializing new git repository..."
cd "$TEMP_DIR"
git init
git config user.email "info@unamifoundation.org"
git config user.name "Unami Foundation"
git branch -m main

# Debug: List files to verify they were copied
echo "Files in temporary directory:"
ls -la

# Add all files and create initial commit
echo "Adding files to new repository..."
git add .
git status

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit - Clean repository"

# Verify commit was created
echo "Verifying commit..."
git log --oneline

# Add the new remote repository
echo "Adding remote repository..."
git remote add origin https://github.com/unamiapp/app.git

# Push to the new repository
echo "Pushing to new repository..."
git push -u origin main --force

# Copy the .git directory back to the original location
echo "Copying new .git directory back to original location..."
cd -
rm -rf .git
cp -r "$TEMP_DIR/.git" .

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Done! Repository has been cleaned and pushed to https://github.com/unamiapp/app"