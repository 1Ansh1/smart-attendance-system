from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.api.routes_auth import router as auth_router
from app.api.routes_students import router as students_router
from app.api.routes_attendance import router as attendance_router
from app.api.routes_faces import router as faces_router
from app.api.routes_attendance import router as attendance_router

app = FastAPI(title="Smart Attendance API")
app.include_router(faces_router)
app.include_router(attendance_router)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description="Smart Attendance API",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    # apply globally (optional but helps)
    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(students_router)
app.include_router(attendance_router)

@app.get("/health")
def health():
    return {"status": "ok"}