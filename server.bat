@echo off
title Start Symbiosis Management System

:: Start backend
start cmd /k "cd backend && node server.js"

:: Start frontend
start cmd /k "cd frontend && npm start"

exit
