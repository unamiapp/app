#!/bin/bash
pkill -f "next dev" 2>/dev/null
sleep 2
env NEXTAUTH_SECRET=c8b74a1f890d1be5e2e59e61c6ac6b12f05a9f71a8e1ab86 npm run dev