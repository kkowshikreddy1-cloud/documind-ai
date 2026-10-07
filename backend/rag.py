import re
import math
from typing import List, Dict, Any, Optional
from backend.db import get_connection

def tokenize(text: str) -> List[str]:
    return re.findall(r"\w+", text.lower())

class DocumentRetriever:
    """Retrieves relevant text, tables, and visual element metadata matching user queries."""
    
    @staticmethod
    def retrieve(query: str, doc_ids: Optional[List[str]] = None, top_k: int = 6) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        
        sql = """
            SELECT id, document_id, document_name, page_number, content_type, section, content, metadata_json, source_reference
            FROM elements
        """
        params = []
        if doc_ids:
            placeholders = ",".join(["?"] * len(doc_ids))
            sql += f" WHERE document_id IN ({placeholders})"
            params.extend(doc_ids)

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return []

        query_tokens = set(tokenize(query))
        scored_results = []

        for row in rows:
            elem = dict(row)
            content_tokens = tokenize(elem["content"])
            section_tokens = tokenize(elem["section"] or "")
            source_tokens = tokenize(elem["source_reference"] or "")

            all_elem_tokens = set(content_tokens + section_tokens + source_tokens)
            
            # Token match score
            overlap = query_tokens.intersection(all_elem_tokens)
            score = len(overlap)

            # Boost if query explicitly asks for tables or charts
            if ("table" in query.lower() or "quarter" in query.lower() or "production" in query.lower() or "defect" in query.lower()) and elem["content_type"] == "table":
                score += 1.5
            if ("chart" in query.lower() or "efficiency" in query.lower() or "downtime" in query.lower() or "trend" in query.lower() or "graph" in query.lower()) and elem["content_type"] in ["chart", "image"]:
                score += 2.0

            # Substring match bonus
            for q_tok in query_tokens:
                if len(q_tok) > 3 and q_tok in elem["content"].lower():
                    score += 0.5

            if score > 0:
                elem["score"] = score
                scored_results.append(elem)

        # Sort descending by relevance score
        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]
