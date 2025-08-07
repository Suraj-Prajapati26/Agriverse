from flask import Flask, request, jsonify
import pickle
import numpy as np

# Load model
with open("yield_model.pkl", "rb") as f:
    model = pickle.load(f)

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    area = float(data["area"])
    rainfall = float(data["rainfall"])
    prediction = model.predict(np.array([[area, rainfall]]))[0]
    return jsonify({"predictedYield": float(prediction), "confidence": 0.9})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
