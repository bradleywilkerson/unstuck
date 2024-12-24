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

# Configure CORS with more permissive settings for development
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
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
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a motivational assistant helping people overcome procrastination."},
                {"role": "system", "content": "Respond with valid JSON only. Format: {\"quote\": {\"text\": \"quote text\", \"author\": \"author name\"}, \"motivation\": \"motivational message\", \"action\": [\"step1\", \"step2\", ...]}"},
                {"role": "system", "content": "Your response style should be very kind and gentle. You are a friend, not a teacher. Consider the task as something that needs to be done at this very moment, and break down the steps to accomplish the task as though the person were just sitting down scrolling on their phone, struggling with executive function, and needing direction with even the smallest things, like standing up or putting on socks and shoes. If it makes sense, add in some breath work or gentle stretching. Suggest other things the user can do to make the task easier in future."},
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