from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import List, Dict, Any
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from io import StringIO  # Correct import
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    api_url: str = "http://localhost:8000"

settings = Settings()

app = FastAPI()


# CORS MIDDLEWARE (React Vite running on port 5173) & FastAPI on port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update to Production URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class DataResponse(BaseModel):
    message: str 
    data : List[Dict[str,Any]]  # Changed to List[dict] for list of records

@app.get("/")
def root():
    return {"Hey":"Prachi"}
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Check if the file is a CSV
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are accepted.")

        # Read the file content
        content = await file.read()
        
        # Convert content to a DataFrame
        df = pd.read_csv(StringIO(content.decode('utf-8')))
        df = df.astype(str)
        # Optional Data PreProcessing
        # df.dropna(axis=1, how='any', inplace=True)
        # df.rename(columns=lambda x: x.strip().lower().replace(' ', '_'), inplace=True)
        
        # Convert DataFrame to a list of dictionaries
        data = df.to_dict(orient='records')

        return DataResponse(message="File uploaded successfully", data=data)
    
    except HTTPException as http_err:
        raise http_err
    except Exception as err:
        # Log error details for debugging
        print(f"Error: {err}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(err)}")
