#!/bin/bash

# Configure git if needed
git config user.email "info@unamifoundation.org"
git config user.name "Unami Foundation"

# Remove any existing git remote
git remote remove origin 2>/dev/null

# Add the new remote
git remote add origin https://github.com/unamiapp/app.git

# Create a new branch if we're not already on main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  git checkout -b main
fi

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Clean repository"

# Push to the new repository
git push -u origin main --force

echo "Done! Repository has been pushed to https://github.com/unamiapp/app"