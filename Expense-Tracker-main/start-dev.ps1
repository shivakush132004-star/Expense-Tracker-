# Start both backend and frontend in new PowerShell windows
$repo = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command cd '$repo\\backend'; if (Test-Path venv) { .\venv\Scripts\Activate }; python main.py"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command cd '$repo\\frontend'; npm start"

Write-Host "Started backend and frontend in new PowerShell windows. Close windows to stop servers."