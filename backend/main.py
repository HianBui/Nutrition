from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import base64
import os
import json
import re
import httpx

load_dotenv()

app = FastAPI(title="Nutrition AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


# ─── Models ────────────────────────────────────────────────────────────────────

class MealPlanRequest(BaseModel):
    goal: str
    calories: int
    dietary: str
    days: int = 7

class BMIRequest(BaseModel):
    weight: float
    height: float
    age: int
    gender: str
    activity: str

class RecipeRequest(BaseModel):
    ingredients: list[str]
    cuisine: str = "any"
    goal: str = "healthy"
    max_time: int = 30


# ─── Helper ────────────────────────────────────────────────────────────────────

def extract_json(text: str) -> dict:
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {"raw": text}


async def call_gemini(parts: list) -> str:
    """Call Gemini API and return text response."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set in .env file")

    payload = {"contents": [{"parts": parts}]}

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        if resp.status_code != 200:
            err = resp.json()
            msg = err.get("error", {}).get("message", resp.text)
            raise HTTPException(status_code=500, detail=f"Gemini API error: {msg}")

        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


# ─── Feature 1: Analyze Food Image ─────────────────────────────────────────────

@app.post("/api/analyze-food")
async def analyze_food(file: UploadFile = File(...)):
    content_type = file.content_type or "image/jpeg"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_data = await file.read()
    if not image_data:
        raise HTTPException(status_code=400, detail="Empty file received")

    base64_image = base64.standard_b64encode(image_data).decode("utf-8")

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    mime_type = content_type if content_type in ALLOWED_TYPES else "image/jpeg"

    prompt = (
        "Analyze this food image and provide nutritional information. "
        "Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text. "
        'Use this exact structure: {"dish_name":"Grilled Chicken","serving_size":"1 plate (300g)",'
        '"calories":420,"macros":{"protein":35,"carbs":30,"fat":12,"fiber":4},'
        '"micros":{"vitamin_c":"15mg","calcium":"80mg","iron":"3mg","sodium":"450mg"},'
        '"health_score":82,"health_tags":["high protein","balanced"],'
        '"tips":["tip1","tip2","tip3"],'
        '"ingredients_detected":["chicken","vegetables"]}'
    )

    parts = [
        {"inline_data": {"mime_type": mime_type, "data": base64_image}},
        {"text": prompt}
    ]

    try:
        raw = await call_gemini(parts)
        data = extract_json(raw)
        return {"success": True, "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ─── Feature 2: Generate Meal Plan ─────────────────────────────────────────────

@app.post("/api/meal-plan")
async def generate_meal_plan(req: MealPlanRequest):
    goal_labels = {
        "lose_weight": "weight loss", "gain_muscle": "muscle gain",
        "maintain": "maintaining current weight", "eat_healthy": "eating healthier"
    }
    goal_text = goal_labels.get(req.goal, req.goal)

    prompt = (
        f"Create a {req.days}-day meal plan. Goal: {goal_text}. "
        f"Daily calories: {req.calories} kcal. Dietary: {req.dietary}.\n"
        "Respond ONLY with a valid JSON object. No markdown, no code fences.\n"
        'Structure: {"summary":"overview text","daily_calories":1800,'
        '"days":[{"day":1,"day_name":"Monday","total_calories":1820,'
        '"meals":{"breakfast":{"name":"Oatmeal","calories":320,"protein":10,"carbs":55,"fat":7,"prep_time":"10 min"},'
        '"lunch":{"name":"Grilled chicken salad","calories":480,"protein":38,"carbs":25,"fat":14,"prep_time":"15 min"},'
        '"dinner":{"name":"Salmon with vegetables","calories":560,"protein":42,"carbs":35,"fat":18,"prep_time":"25 min"},'
        '"snack":{"name":"Greek yogurt","calories":150,"protein":12,"carbs":18,"fat":3,"prep_time":"2 min"}}}],'
        '"shopping_list":["oats","chicken breast","salmon"],'
        '"tips":["Meal prep on Sunday","Stay hydrated"]}'
    )

    try:
        raw = await call_gemini([{"text": prompt}])
        data = extract_json(raw)
        return {"success": True, "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Meal plan failed: {str(e)}")


# ─── Feature 3: BMI & Health Analysis ──────────────────────────────────────────

@app.post("/api/health-analysis")
async def health_analysis(req: BMIRequest):
    bmi = req.weight / ((req.height / 100) ** 2)
    multipliers = {"sedentary":1.2,"light":1.375,"moderate":1.55,"active":1.725,"very_active":1.9}
    multiplier = multipliers.get(req.activity, 1.55)

    if req.gender == "male":
        bmr = 88.362 + (13.397 * req.weight) + (4.799 * req.height) - (5.677 * req.age)
    else:
        bmr = 447.593 + (9.247 * req.weight) + (3.098 * req.height) - (4.330 * req.age)

    tdee = bmr * multiplier

    prompt = (
        f"Analyze health: weight={req.weight}kg, height={req.height}cm, "
        f"age={req.age}, gender={req.gender}, activity={req.activity}. "
        f"BMI={bmi:.1f}, BMR={bmr:.0f}, TDEE={tdee:.0f}.\n"
        "Respond ONLY with a valid JSON object. No markdown, no code fences.\n"
        f'{{"bmi":{bmi:.1f},"bmi_category":"fill this","bmr":{bmr:.0f},"tdee":{tdee:.0f},'
        '"ideal_weight_range":{"min":0,"max":0},"health_score":0,'
        '"risk_factors":["factor1"],"strengths":["strength1"],'
        f'"calorie_goals":{{"lose_weight":{int(tdee-500)},"maintain":{int(tdee)},"gain_muscle":{int(tdee+300)}}},'
        '"macro_targets":{"protein_g":0,"carbs_g":0,"fat_g":0},'
        '"recommendations":["rec1","rec2","rec3","rec4"],'
        '"priority_nutrients":["nutrient1","nutrient2"]}}'
    )

    try:
        raw = await call_gemini([{"text": prompt}])
        data = extract_json(raw)
        return {"success": True, "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health analysis failed: {str(e)}")


# ─── Feature 4: Recipe Suggestion ──────────────────────────────────────────────

@app.post("/api/suggest-recipes")
async def suggest_recipes(req: RecipeRequest):
    ingredients_text = ", ".join(req.ingredients)

    prompt = (
        f"Suggest 3 healthy recipes using: {ingredients_text}. "
        f"Cuisine: {req.cuisine}. Goal: {req.goal}. Max time: {req.max_time} min.\n"
        "Respond ONLY with a valid JSON object. No markdown, no code fences.\n"
        '{"recipes":[{"name":"Recipe name","description":"Brief description",'
        '"cooking_time":20,"servings":2,"difficulty":"Easy",'
        '"calories_per_serving":380,"macros":{"protein":32,"carbs":38,"fat":11},'
        '"ingredients":["200g item","1 cup item"],'
        '"instructions":["Step 1","Step 2","Step 3"],'
        '"health_benefits":["benefit 1","benefit 2"],'
        '"health_score":84,"tags":["high-protein","quick"]}],'
        '"nutrition_tip":"A helpful nutrition tip"}'
    )

    try:
        raw = await call_gemini([{"text": prompt}])
        data = extract_json(raw)
        return {"success": True, "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe suggestion failed: {str(e)}")


# ─── Health Check ───────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Nutrition AI API is running (Gemini)", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}
