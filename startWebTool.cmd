@ECHO OFF
start /b pm2 start webTool.js --watch
start /b pm2 imonit
Echo 'port£º5729'
pause