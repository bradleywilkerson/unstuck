from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://unstuck-bradleywilkerson.vercel.app",
    "https://unstuck-git-main-bradleywilkerson.vercel.app",
    "https://unstuck-two.vercel.app",
    "https://unstuck-4mh2.onrender.com",
    "https://unrot.me",
    "https://www.unrot.me"
]

# Log the allowed origins for debugging
logger.info(f"Configured allowed origins: {allowed_origins}")

if os.getenv("ALLOWED_ORIGINS"):
    additional_origins = os.getenv("ALLOWED_ORIGINS").split(",")
    allowed_origins.extend([origin.strip() for origin in additional_origins])
    logger.info(f"Added additional origins from env: {additional_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Add CORS debugging route
@app.options("/gpt")
async def options_gpt():
    return JSONResponse(
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

class TaskEntry(BaseModel):
    taskEntries: List[str]

async def process_input(task: str) -> dict:
    try:
        # Initialize OpenAI client
        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        if not client.api_key:
            logger.error("OpenAI API key not found")
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        # Create a prompt for GPT
        prompt = f"I am procrastinating on this task: {task}"
        
        logger.info(f"Sending prompt to OpenAI: {prompt}")
        
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL"),
            messages=[
                {"role": "system", "content": "You are a motivational assistant helping people overcome procrastination."},
                {"role": "system", "content": "Respond with valid JSON only. Format: {\"quote\": {\"text\": \"quote text\", \"author\": \"author name\"}, \"motivation\": \"motivational message\", \"action\": [\"step1\", \"step2\", ...]}"},
                {"role": "system", "content": "Your response style should be very kind and gentle. You are a friend, not a teacher. Consider the task as something that needs to be done at this very moment, and break down the steps to accomplish the task as though the person were just sitting down scrolling on their phone, struggling with executive function, and needing direction with even the smallest things, like standing up or putting on socks and shoes. More specifically, assume the user is scrolling on tiktok. If it makes sense, add in some breath work or gentle stretching. Suggest other things the user can do to make the task easier in future."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        # Parse GPT's response into structured data
        content = response.choices[0].message.content
        logger.info(f"Received response from OpenAI: {content}")
        
        # Parse the JSON response and add the task name
        response_dict = json.loads(content)
        response_dict["taskName"] = task
        logger.info(f"Parsed JSON response: {response_dict}")
        return response_dict

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to parse GPT response as JSON")
    except Exception as e:
        logger.error(f"Error in process_input: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gpt")
async def gpt_endpoint(task_entry: TaskEntry):
    logger.info(f"Received task entries: {task_entry.taskEntries}")
    try:
        results = []
        for task in task_entry.taskEntries:
            result = await process_input(task)
            results.append(result)
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error in endpoint: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )