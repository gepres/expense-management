@echo off
REM Helper script to run Playwright tests with correct browser path on Windows
SET PLAYWRIGHT_BROWSERS_PATH=C:\Users\User\AppData\Local\ms-playwright
npm run test:e2e %*
