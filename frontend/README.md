# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


1. Navigate to the Backend Directory
Open your terminal and move into the backend folder:

powershell
cd d:\orangeai\backend
2. Set Up a Virtual Environment (Recommended)
If you haven't already, create and activate a virtual environment to keep dependencies isolated:

powershell
# Create venv
python -m venv venv
# Activate venv (Windows)
.\venv\Scripts\activate
3. Install Dependencies
Install the required Python packages:

powershell
pip install -r requirements.txt
4. Run the Server
Use uvicorn to start the application. The --reload flag allows the server to restart automatically when you make code changes:

powershell
uvicorn main:app --reload --port 8000