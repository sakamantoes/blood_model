Anemia Prediction from CBC - Project scaffold

Structure:
- python_backend: Flask API, training script, model, data
- node_backend: Express server that calls Python API and stores history
- client: Minimal React app to test API

Usage:
1) Python backend:
   cd python_backend
   pip install -r requirements.txt
   python train_model.py
   python predict_api.py

2) Node backend:
   cd ../node_backend
   npm install
   node server.js

3) Client (React):
   run a React dev server pointing to client/src/App.jsx (Vite / CRA)
CSV dataset path: python_backend/data/anemia_cbc.csv
