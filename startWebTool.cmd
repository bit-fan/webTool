@ECHO OFF
start /b pm2 start webTool.js --watch
start /b pm2 imonit
pause