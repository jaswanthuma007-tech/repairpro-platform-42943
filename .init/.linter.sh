#!/bin/bash
cd /home/kavia/workspace/code-generation/repairpro-platform-42943/react_tailwind_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

