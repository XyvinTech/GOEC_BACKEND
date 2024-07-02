@echo off
echo Building Docker image...
docker build -t latest .
echo Running Docker container...
docker run -d --name non_ocpp2 latest
echo Container is running.
pause
