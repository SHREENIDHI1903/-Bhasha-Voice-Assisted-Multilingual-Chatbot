@echo off
echo Starting Voice Chatbot Backend in PRODUCTION mode...
:: Load environment variables from .env is handled by python-dotenv in main.py
:: We run uvicorn directly. In a real Linux prod, we'd use gunicorn -w 1 -k uvicorn.workers.UvicornWorker
:: On Windows, we stick to uvicorn. Workers=1 is crucial for connection_manager state.

call venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 --log-level info
pause
