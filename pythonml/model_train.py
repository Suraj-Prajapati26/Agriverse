import pickle
from sklearn.linear_model import LinearRegression
import numpy as np

# Dummy training data
X = np.array([[1, 50], [2, 60], [3, 70], [4, 80], [5, 100]])
y = np.array([10, 20, 30, 40, 50])

model = LinearRegression()
model.fit(X, y)

with open("yield_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved as yield_model.pkl")
