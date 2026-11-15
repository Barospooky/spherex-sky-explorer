from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
=======
from archive import router
>>>>>>> origin/main

app = FastAPI(title="SPHEREx Sky Explorer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
<<<<<<< HEAD
    allow_methods=["GET"],
=======
    allow_methods=["*"],
>>>>>>> origin/main
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SPHEREx Sky Explorer API is running"}

@app.get("/api/health")
def health():
    return {"status": "ok", "project": "SPHEREx Sky Explorer", "data_mode": "practice"}

<<<<<<< HEAD
from archive import router
=======
>>>>>>> origin/main
app.include_router(router)
