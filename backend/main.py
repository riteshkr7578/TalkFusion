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
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a programming assistant. "
                        "Always respond in a SIMPLE and FORMATTED way:\n"
                        "- Give a short title\n"
                        "- Show the solution code in a markdown code block\n"
                        "- Add very brief working (1–2 lines only)\n"
                        "- Add example output if applicable\n"
                        "Do NOT give long explanations."
                    )
                },
                {
                    "role": "user",
                    "content": req.message
                }
            ]
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        return {"error": str(e)}

@app.api_route("/", methods=["GET", "HEAD"])
async def health(request: Request):
    return {"status": "ok", "message": "Backend is awake!"}