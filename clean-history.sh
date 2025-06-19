#!/bin/bash

# Create a new branch from the current state
git checkout -b clean-main

# Remove the remote origin to prevent accidental pushes
git remote rm origin

# Create a new commit that removes the merge message reference
git commit --allow-empty -m "Clean repository history"

# Now you can add your new remote and push
echo "History cleaned. You can now add your new remote with:"
echo "git remote add origin https://github.com/your-new-username/your-new-repo.git"
echo "git push -u origin clean-main:main --force"
