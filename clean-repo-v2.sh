#!/bin/bash

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy all files except .git directory
echo "Copying files to temporary directory..."
cp -r $(ls -A | grep -v "\.git\|clean-repo.*\.sh") $TEMP_DIR/

# Initialize a new git repository in the temporary directory
echo "Initializing new git repository..."
cd $TEMP_DIR
git init
git config user.email "info@unamifoundation.org"
git config user.name "Unami Foundation"
git branch -m main

# Add all files and create initial commit
echo "Adding files to new repository..."
git add .
git commit -m "Initial commit - Clean repository"

# Copy the .git directory back to the original location
echo "Copying new .git directory back to original location..."
cd -
rm -rf .git
cp -r $TEMP_DIR/.git .

# Clean up
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Done! You now have a clean repository without any Codespaces history."
echo "You can now add your new remote with:"
echo "git remote add origin https://github.com/unamiapp/app.git"
echo "git push -u origin main"
