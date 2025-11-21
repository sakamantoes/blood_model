from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, os, numpy as np, pandas as pd

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join("models","anemia_model.pkl")
META_PATH = os.path.join("models","metadata.pkl")

model = joblib.load(MODEL_PATH)
meta = joblib.load(META_PATH)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    try:
        df = pd.DataFrame([data])
        df["Sex_enc"] = df["Sex"].map(lambda s: 0 if s==meta['label_encoders']['Sex'][0] else 1)
        X = df[meta['features']]
        prob = model.predict_proba(X)[:,1][0]
        pred = int(model.predict(X)[0])
        return jsonify({"anemia": pred, "probability": float(prob), "message": "Anemia" if pred==1 else "No anemia"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
