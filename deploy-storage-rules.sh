#!/bin/bash
echo "Deploying Firebase Storage rules..."
firebase deploy --only storage
echo "Deployment complete!"