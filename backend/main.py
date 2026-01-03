from fastapi import FastAPI
from fastapi import Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    
@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        user_message = req.message.lower()

        # Detect programming / code questions
        is_code_question = any(keyword in user_message for keyword in [
            "code", "program", "wap", "python", "java", "c++",
            "function", "algorithm", "script"
        ])

        if is_code_question:
            system_prompt = (
                "You are a programming assistant. "
                "Respond briefly and in a formatted way:\n"
                "- Short title\n"
                "- Code in a markdown code block\n"
                "- Very brief explanation (1–2 lines)\n"
                "Do not add unnecessary details."
            )
        else:
            system_prompt = (
                "You are a helpful assistant. "
                "Answer in simple, clear text.\n"
                "- No code blocks\n"
                "- No examples unless asked\n"
                "- Keep it short and informative"
            )

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ]
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        return {"error": str(e)}


@app.api_route("/", methods=["GET", "HEAD"])
async def health(request: Request):
    return {"status": "ok", "message": "Backend is awake!"}