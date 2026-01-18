# 🎙️ Bhasha: Voice-Assisted Multilingual Chatbot

A powerful, real-time voice-assisted chatbot platform designed to bridge language barriers between customers and support agents. Built with **React**, **FastAPI**, and **Meta's MMS-1B** model, it supports seamless voice-to-voice communication across **20+ languages**.

---

## 🚀 Key Features

*   **🗣️ Real-Time Voice Transcription**: State-of-the-art ASR using **Meta MMS-1B** (Massively Multilingual Speech) for highly accurate speech recognition.
*   **🌍 Multilingual Support**: 
    *   **Indian Languages**: Hindi, Kannada, Tamil, Telugu, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, Odia, etc.
    *   **Global Languages**: English, Spanish, French, German, Chinese, Japanese, Arabic, etc.
*   **🔄 Instant Translation**: Automatic translation between the speaker's language and the listener's language (powered by `deep-translator`).
*   **🔊 Text-to-Speech (TTS)**: Responses are read aloud in the native language using Google TTS.
*   **👥 Role-Based Access Control (RBAC)**:
    *   **Customers**: Easy login, auto-queueing for agents.
    *   **Employees**: Secure login requiring Admin approval.
    *   **Admins**: Dashboard to manage users, approve access, and block/ban users.
*   **⚡ Low Latency**: Optimized for CPU inference using `asyncio` threading, Smart VAD (Voice Activity Detection), and Raw PCM audio streaming.
*   **🛡️ Secure & Robust**: Protected routes, WebSocket stability/recovery, and persistent user management.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: React (Vite)
*   **Language**: JavaScript (ES6+)
*   **Audio**: Web Audio API (AudioWorklet), raw PCM processing (Float32).
*   **Communication**: Native WebSockets (`useWebSocket` hook).
*   **Router**: `react-router-dom` v6.
*   **Styling**: Inline CSS / Lucide React Icons.

### **Backend**
*   **Framework**: FastAPI (Python 3.10+) based implementation.
*   **ASR Model**: `facebook/mms-1b-all` (Hugging Face Transformers).
*   **Server**: Uvicorn (ASGI).
*   **Concurrency**: `asyncio` event loop + ThreadPoolExecutor for blocking ML tasks.
*   **Libraries**: `torch`, `transformers`, `numpy`, `librosa`, `gTTS`, `deep-translator`.

---

## 📋 Prerequisites

*   **OS**: Windows / Linux / Mac.
*   **Python**: Version 3.10 or higher.
*   **Node.js**: Version 16 or higher.
*   **RAM**: Minimum **8 GB** (16 GB Recommended) due to the 1B parameter AI model.
*   **Microphone**: Working audio input.

---

## ⚙️ Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/voice-assisted-chatbot.git
cd voice-assisted-chatbot
```

### 2. Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Linux/Mac
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: `torch` installation might vary based on your system (CPU vs GPU). Check [pytorch.org](https://pytorch.org/) if needed.*

### 3. Frontend Setup
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install Node modules:
    ```bash
    npm install
    ```

---

## ▶️ Running the Application

### Step 1: Start the Backend Server
In your backend terminal (with `venv` active):
```bash
python -m app.main
```
*Note: First run will take a few minutes to download the 1B parameter model (~4GB).*
*Server will run at `http://localhost:8000`*

### Step 2: Start the Frontend Client
In your frontend terminal:
```bash
npm run dev
```
*Client will run at `http://localhost:5173`*

---

## 📖 Usage Guide

### 🔐 1. Admin Panel
*   Go to `http://localhost:5173/admin`
*   **Default Login**:
    *   **Username**: `admin`
    *   **Password**: `admin`
*   **Features**:
    *   **Approve New Employees**: Employees cannot log in until you approve them here.
    *   **Block Users**: Revoke access for any active user.
    *   **View Users**: See a list of all pending and active staff.

### 👤 2. Customer Flow
*   Go to the **Landing Page** (`/`).
*   Select **Customer**.
*   Enter a **Name** and select your **Language**.
*   Click **Start Chat**.
*   You will be connected to an available Employee or placed in a queue.

### 👨‍💼 3. Employee Flow
*   Go to the **Landing Page**.
*   Select **Employee**.
*   **Register/Login**: First time users must Register.
*   **Wait for Approval**: Ask an Admin to approve your account.
*   Once approved, login to enter the dashboard and connect with customers.

---

## 🐛 Troubleshooting

*   **WebSocket Error / Connection Closed**:
    *   Ensure the backend is fully started and displayed `[INFO] Application startup complete`.
    *   Check if port `8000` is free. Kill python processes if needed (`Stop-Process -Name python -Force` in PowerShell).
*   **"ur does not exist" Error**:
    *   The backend automatically re-maps `ur` (Urdu) to `urd-script_arabic`. Ensure you have pulled the latest backend code.
*   **Transcription is Slow**:
    *   The MMS-1B model is heavy. Ensure you are running on a machine with decent CPU/RAM. The logs will show "Latency Optimization" events.

---

## 📜 License

**Copyright © 2026 Shreenidhi. All Rights Reserved.**

This project is **Proprietary Software**.
Unauthorized copying, modification, distribution, or use of this file, via any medium, is strictly prohibited.


## 👨‍💻 About the Developer

**Shreenidhi**  
Connect with me on LinkedIn: [linkedin.com/in/shreenidhi1903](http://www.linkedin.com/in/shreenidhi1903)
