@echo off
title DocuMind AI Servers
echo ==========================================
echo Starting DocuMind AI Full-Stack Platform...
echo ==========================================

start "DocuMind Backend (FastAPI)" cmd /k "cd /d c:\Users\KOWSHIK REDDY\OneDrive\Documents\BLOGGER && "C:\Users\KOWSHIK REDDY\AppData\Local\Python\bin\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

start "DocuMind Frontend (Vite)" cmd /k "cd /d c:\Users\KOWSHIK REDDY\OneDrive\Documents\BLOGGER && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

start http://127.0.0.1:5173
