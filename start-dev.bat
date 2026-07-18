@echo off
echo =======================================================
echo           Starting ShareBite Platform Dev Servers      
echo =======================================================
echo.
echo Starting Express Backend on http://localhost:5000 ...
start cmd /k "cd backend && npm run dev"
echo.
echo Starting Vite Frontend on http://localhost:5173 ...
start cmd /k "cd frontend && npm run dev"
echo.
echo =======================================================
echo Both servers started!
echo Close the command prompts to stop the servers.
echo =======================================================
pause
