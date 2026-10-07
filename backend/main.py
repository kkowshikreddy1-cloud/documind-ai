import os
import json
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import settings, UPLOAD_DIR, PROCESSED_DIR, DEMO_DATA_DIR
from backend.db import get_connection, init_db
from backend.processor import DocumentProcessor
from backend.rag import DocumentRetriever
from backend.reasoning import MultimodalReasoner
from backend.demo_generator import create_demo_pdf

# Ensure DB and directories are prepared
init_db()

app = FastAPI(
    title="DocuMind AI Backend",
    description="Multimodal Document Intelligence and Decision Support System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for processed pages, thumbnails, and visual crops
app.mount("/processed", StaticFiles(directory=str(PROCESSED_DIR)), name="processed")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Pydantic Schemas
class QueryRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None

class StatusUpdateRequest(BaseModel):
    status: str

class ScenarioRequest(BaseModel):
    baseline_downtime_hours: float = 18.0
    reduction_percentage: float = 20.0
    units_per_hour: float = 75.0
    hourly_operating_cost: float = 450.0

# ----------------- DOCUMENT ENDPOINTS -----------------

@app.get("/api/stats")
def get_stats():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM documents WHERE status = 'completed'")
    docs_count = c.fetchone()[0]
    c.execute("SELECT COALESCE(SUM(total_pages), 0) FROM documents WHERE status = 'completed'")
    pages_count = c.fetchone()[0]
    c.execute("SELECT COALESCE(SUM(tables_count), 0) FROM documents WHERE status = 'completed'")
    tables_count = c.fetchone()[0]
    c.execute("SELECT COALESCE(SUM(charts_count + images_count), 0) FROM documents WHERE status = 'completed'")
    visuals_count = c.fetchone()[0]
    conn.close()
    return {
        "documents": docs_count,
        "pages_analyzed": pages_count,
        "tables_detected": tables_count,
        "visuals_analyzed": visuals_count
    }

@app.get("/api/documents")
def list_documents():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM documents ORDER BY created_at DESC")
    docs = [dict(row) for row in c.fetchall()]
    conn.close()
    return docs

@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    doc = c.fetchone()
    if not doc:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_dict = dict(doc)
    c.execute("SELECT * FROM pages WHERE document_id = ? ORDER BY page_number ASC", (doc_id,))
    pages = [dict(p) for p in c.fetchall()]
    doc_dict["pages"] = pages
    conn.close()
    return doc_dict

@app.get("/api/documents/{doc_id}/pages/{page_num}/elements")
def get_page_elements(doc_id: str, page_num: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM elements 
        WHERE document_id = ? AND page_number = ?
        ORDER BY content_type ASC
    """, (doc_id, page_num))
    elems = [dict(e) for e in c.fetchall()]
    conn.close()
    return elems

@app.post("/api/documents/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    doc_id = str(uuid.uuid4())
    safe_filename = file.filename.replace(" ", "_")
    target_path = UPLOAD_DIR / f"{doc_id}_{safe_filename}"

    with open(target_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        file_size = len(content)

    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO documents (id, filename, filepath, file_size, status)
        VALUES (?, ?, ?, ?, 'processing')
    """, (doc_id, safe_filename, str(target_path), file_size))
    conn.commit()
    conn.close()

    # Process immediately or via background task
    def process_task():
        processor = DocumentProcessor(doc_id, str(target_path), safe_filename)
        processor.process()

    background_tasks.add_task(process_task)

    return {
        "document_id": doc_id,
        "filename": safe_filename,
        "status": "processing",
        "message": "Document uploaded and queued for multimodal intelligence extraction"
    }

@app.post("/api/demo/load")
def load_demo_dataset():
    """Generates the realistic 6-page report and indexes it immediately."""
    demo_pdf = DEMO_DATA_DIR / "Global_Operations_Report_2025.pdf"
    create_demo_pdf(str(demo_pdf))

    conn = get_connection()
    c = conn.cursor()
    # Check if demo doc already exists
    c.execute("SELECT id FROM documents WHERE filename = 'Global_Operations_Report_2025.pdf'")
    existing = c.fetchone()
    if existing:
        doc_id = existing[0]
        conn.close()
        return {"document_id": doc_id, "status": "already_loaded"}

    doc_id = str(uuid.uuid4())
    file_size = os.path.getsize(str(demo_pdf))
    c.execute("""
        INSERT INTO documents (id, filename, filepath, file_size, status)
        VALUES (?, ?, ?, ?, 'processing')
    """, (doc_id, "Global_Operations_Report_2025.pdf", str(demo_pdf), file_size))
    conn.commit()
    conn.close()

    # Process synchronously for instant demo readiness
    processor = DocumentProcessor(doc_id, str(demo_pdf), "Global_Operations_Report_2025.pdf")
    processor.process()

    return {"document_id": doc_id, "status": "completed", "message": "Demo document generated and processed."}

# ----------------- AI ANALYST & REASONING -----------------

@app.post("/api/query")
def process_query(payload: QueryRequest):
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    retrieved = DocumentRetriever.retrieve(question, payload.document_ids, top_k=6)
    reasoning_result = MultimodalReasoner.answer_query(question, retrieved)

    # Store query history
    query_id = str(uuid.uuid4())
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO query_history (id, question, answer, explanation, calculation, confidence, documents_used, evidence_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        query_id,
        question,
        reasoning_result.get("answer", ""),
        reasoning_result.get("explanation", ""),
        reasoning_result.get("calculation"),
        reasoning_result.get("confidence", "high"),
        ", ".join(set([e.get("document_name", "") for e in reasoning_result.get("evidence", [])])),
        json.dumps(reasoning_result.get("evidence", []))
    ))
    conn.commit()
    conn.close()

    reasoning_result["id"] = query_id
    return reasoning_result

@app.get("/api/history")
def get_history():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM query_history ORDER BY created_at DESC LIMIT 50")
    hist = []
    for row in c.fetchall():
        item = dict(row)
        if item.get("evidence_json"):
            item["evidence"] = json.loads(item["evidence_json"])
        hist.append(item)
    conn.close()
    return hist

# ----------------- INSIGHTS, RECOMMENDATIONS & ACTION PLANS -----------------

@app.get("/api/insights")
def get_insights():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM insights ORDER BY created_at DESC")
    insights = [dict(row) for row in c.fetchall()]
    conn.close()
    return insights

@app.get("/api/recommendations")
def get_recommendations():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM recommendations ORDER BY created_at DESC")
    recs = [dict(row) for row in c.fetchall()]
    conn.close()
    return recs

@app.get("/api/action-plans")
def get_action_plans():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM action_plans ORDER BY priority ASC, created_at DESC")
    plans = [dict(row) for row in c.fetchall()]
    conn.close()
    return plans

@app.post("/api/action-plans/{plan_id}/status")
def update_action_plan_status(plan_id: str, payload: StatusUpdateRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE action_plans SET status = ? WHERE id = ?", (payload.status, plan_id))
    conn.commit()
    conn.close()
    return {"status": "success", "id": plan_id, "new_status": payload.status}

# ----------------- SCENARIO LAB (WHAT-IF SIMULATION) -----------------

@app.post("/api/scenario")
def calculate_scenario(payload: ScenarioRequest):
    baseline = payload.baseline_downtime_hours
    pct = payload.reduction_percentage / 100.0
    recovered_hours = baseline * pct
    projected_downtime = baseline - recovered_hours

    units_per_hr = payload.units_per_hour
    hourly_cost = payload.hourly_operating_cost

    incremental_units_mo = recovered_hours * units_per_hr
    incremental_units_yr = incremental_units_mo * 12
    cost_savings_mo = recovered_hours * hourly_cost
    cost_savings_yr = cost_savings_mo * 12

    return {
        "baseline_downtime_hours": baseline,
        "reduction_percentage": payload.reduction_percentage,
        "projected_downtime_hours": round(projected_downtime, 2),
        "recovered_hours_monthly": round(recovered_hours, 2),
        "recovered_hours_annual": round(recovered_hours * 12, 2),
        "incremental_units_monthly": round(incremental_units_mo, 0),
        "incremental_units_annual": round(incremental_units_yr, 0),
        "estimated_cost_savings_monthly": round(cost_savings_mo, 2),
        "estimated_cost_savings_annual": round(cost_savings_yr, 2),
        "disclaimer": "Scenario estimate — not a guaranteed prediction. Based on 18.0 hr/mo baseline and 75 units/hr standard cadence."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
