# MindBalance: Student Wellbeing Score Estimator

MindBalance is a small machine learning project that estimates a student's mental health score from daily habits and lifestyle information.

The project has two parts:

- A web page where a student enters their information.
- A FastAPI backend that sends the information to a trained machine learning model and returns a score from 0 to 10.

This score is meant for learning and general information only. It is not a medical or clinical assessment.

## What the project measures

The form asks for information such as:

- Age, gender, country, and academic level
- Most-used social media platform
- Main reason for using social media
- Daily screen time and phone unlocks
- Study hours, physical activity, and sleep
- Perceived stress level

After the form is submitted, the result panel displays the predicted score and a simple description of the result.

## Project files

| File | Description |
| --- | --- |
| `index.html` | The frontend form and result page |
| `style.css` | The design and responsive layout |
| `script.js` | Form validation and requests to the API |
| `main.py` | FastAPI backend and prediction endpoint |
| `Mental_Health_Model.pkl` | Trained machine learning model |
| `Student Social Media And Mental Health Impact.csv` | Dataset used for the project |
| `ML_Project.ipynb` | Notebook containing the machine learning work |
| `requirements.txt` | Python packages needed by the backend |

## Requirements

Install the following before running the project:

- Python 3.9 or newer
- A modern web browser
- A local Python environment such as `venv`

## Run the backend

Open a terminal in the project folder and run:

```bash
python -m venv .venv
```

Activate the virtual environment.

On Windows:

```bash
.venv\Scripts\activate
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --port 2200
```

The API will be available at:

```text
http://127.0.0.1:2200
```

You can also open the automatic API documentation at:

```text
http://127.0.0.1:2200/docs
```

## Run the frontend

Keep the backend running, then open `index.html` in a browser.

The current frontend is configured to use the deployed API at:

```text
https://mindbalance-student-wellbeing-score.onrender.com/
```

If you want the frontend to use your local backend, open `script.js` and change:

```javascript
const API_BASE = "https://mindbalance-api-d9n2.onrender.com/";
```

to:

```javascript
const API_BASE = "http://127.0.0.1:2200";
```

You can open the HTML file directly, or serve the folder with a simple local web server:

```bash
python -m http.server 5500
```

Then visit:

```text
http://127.0.0.1:5500
```

## API usage

The backend provides a `POST /predict` endpoint.

Example request:

```json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 60,
  "study_hours": 5,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

Example response:

```json
{
  "predicted_mental_health_score": 6.78
}
```

The API checks the submitted values before making a prediction. For example, age must be between 10 and 100, and the hour-based values must be between 0 and 24.

## How the score is shown

The frontend groups the score into three simple bands:

- Below 4: strained
- From 4 to below 7: balanced
- 7 or above: strong

These labels are only a simple way to explain the model output. They should not be used to diagnose or judge anyone's mental health.

## Important limitations

- The prediction is based on patterns in the training data and may not be accurate for every person.
- A model score cannot replace help from a qualified mental health professional.
- Do not use the result for medical, academic, employment, or other high-impact decisions.
- The backend currently allows requests from all origins through CORS. This is convenient for a demo, but it should be restricted before using the project in production.
- The frontend contains a fixed API URL. Update `API_BASE` when deploying the backend somewhere else.

If you are struggling or feel unsafe, contact a trusted person or a qualified local mental health service.
