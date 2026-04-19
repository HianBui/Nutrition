# Nutrition AI

A full-stack nutrition application with 4 AI-powered features built with React (frontend) and Python FastAPI (backend), powered by Anthropic Claude AI.

## Features

| Feature | Description |
|---|---|
| **Food Scanner** | Upload a food photo → get instant calories, macros, micros, health score |
| **Meal Planner** | Set your goal & calories → get a personalized weekly meal plan + shopping list |
| **Health Analysis** | Enter weight/height/age/activity → get BMI, TDEE, macro targets, recommendations |
| **Recipe AI** | List your ingredients → get 3 healthy recipes with full instructions |

---

## Project Structure

```
nutrition/
├── backend/
│   ├── .env.example       # Environment variable template
│   ├── main.py            # FastAPI app with 4 AI endpoints
│   └── requirements.txt   # Python dependencies
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── FoodAnalyzer.jsx
    │   │   ├── MealPlan.jsx
    │   │   ├── HealthAnalysis.jsx
    │   │   └── RecipeSuggester.jsx
    │   ├── services/
    │   │   └── api.js        # Axios API calls
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **Anthropic API Key** (free tier available at https://console.anthropic.com)

---

## Installation & Setup

### 1. Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd nutrition/backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Edit .env and paste your API key
# Open .env in any text editor and set:
# ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Start the backend server:**

```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd nutrition/frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Make sure the backend is running on port 8000
3. Navigate between the 4 features using the top navigation

### Food Scanner
- Click "Drop a food photo here" or drag and drop any food image
- Click "Analyze Nutrition" to get the AI breakdown

### Meal Planner
- Choose your goal (lose weight, gain muscle, maintain, eat healthy)
- Set your daily calorie target and dietary preferences
- Click "Generate Plan" for a customized multi-day plan

### Health Analysis
- Enter your weight (kg), height (cm), age, gender, and activity level
- Click "Analyze Health" to get BMI, TDEE, macro targets, and recommendations

### Recipe AI
- Type ingredients you have available (comma-separated)
- Choose a cuisine style, health goal, and max cooking time
- Click "Find Recipes" for 3 tailored healthy recipes

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-food` | Analyze food image (multipart/form-data) |
| `POST` | `/api/meal-plan` | Generate meal plan |
| `POST` | `/api/health-analysis` | BMI and health analysis |
| `POST` | `/api/suggest-recipes` | Recipe suggestions from ingredients |
| `GET` | `/health` | Health check |

---

## Troubleshooting

**Backend won't start:**
- Make sure your virtual environment is activated
- Check that `.env` contains a valid `ANTHROPIC_API_KEY`
- Ensure port 8000 is not in use

**Frontend can't connect to backend:**
- Make sure both servers are running simultaneously
- The Vite proxy forwards `/api` requests to `http://localhost:8000`

**Analysis returns an error:**
- Check the backend console for error details
- Verify your API key is valid and has available credits
- For food images, ensure the file is a valid image (JPG, PNG, WEBP)

---

## Tech Stack

- **Frontend:** React 18, React Router, Recharts, React Dropzone, Framer Motion, Vite
- **Backend:** FastAPI, Uvicorn, Anthropic SDK, Pillow, Python-dotenv
- **AI Model:** Claude 3 Haiku (fast, cost-efficient, free tier eligible)
