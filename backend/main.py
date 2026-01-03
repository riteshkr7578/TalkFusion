from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import os
from typing import List, Optional

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

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        user_message = req.message.lower()

        # Detect programming-related queries
        is_code_question = any(keyword in user_message for keyword in [
            "code", "program", "wap", "python", "java", "c++",
            "function", "algorithm", "script"
        ])

        if is_code_question:
            system_prompt = (
                "You are a programming assistant. "
                "Respond in a clean and concise format:\n"
                "- Short title\n"
                "- Code in a markdown code block\n"
                "- Brief explanation (2–3 lines max)\n"
                "Avoid unnecessary theory."
            )
        else:
            system_prompt = (
                "You are a knowledgeable assistant. "
                "Respond using MARKDOWN formatting:\n"
                "- Start with a clear heading\n"
                "- Use bullet points or short paragraphs\n"
                "- Highlight key sections with **bold text**\n"
                "- Do NOT include code blocks unless explicitly asked\n"
                "- Keep the explanation moderately detailed and structured"
            )

        # 🔥 STEP 3: BUILD MESSAGE LIST WITH HISTORY
        messages = [
            {"role": "system", "content": system_prompt}
        ]

        # Add previous conversation (memory)
        for msg in req.history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": req.message
        })

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        return {"error": str(e)}



@app.api_route("/", methods=["GET", "HEAD"])
async def health(request: Request):
    return {"status": "ok", "message": "Backend is awake!"}
