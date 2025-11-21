import pandas as pd
import os, joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score

DATA_PATH = os.path.join("data", "anemia_cbc.csv")
MODEL_PATH = os.path.join("models", "anemia_model.pkl")
META_PATH = os.path.join("models", "metadata.pkl")

os.makedirs("models", exist_ok=True)

df = pd.read_csv(DATA_PATH)
le = LabelEncoder()
df["Sex_enc"] = le.fit_transform(df["Sex"])

features = ["Age","Sex_enc","Hemoglobin","Hematocrit","RBC","MCV","MCH","MCHC","WBC","Platelets"]
X = df[features]
y = df["Anemia"]

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2, random_state=42, stratify=y)

clf = RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1)
clf.fit(X_train, y_train)

ypred = clf.predict(X_test)
yprob = clf.predict_proba(X_test)[:,1]

print("Accuracy:", accuracy_score(y_test, ypred))
print("ROC AUC:", roc_auc_score(y_test, yprob))
print(classification_report(y_test, ypred))

joblib.dump(clf, MODEL_PATH)
joblib.dump({"features":features, "label_encoders": {"Sex": list(le.classes_)}}, META_PATH)
print("Model and metadata saved to models/")
