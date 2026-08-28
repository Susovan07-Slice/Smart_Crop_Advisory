from fastapi import APIRouter, HTTPException
from schemas.chat import ChatRequest, ChatResponse
from services import llm_service
import uuid

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Central orchestrator endpoint.
    Takes user natural language message, decides what to do, and returns a response.
    """
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Build context from request if provided (e.g. current location, soil data from frontend)
        context_str = ""
        if request.context:
            context_str = "\n".join([f"{k}: {v}" for k, v in request.context.items()])
            
        # In a more advanced version, this is where you would call:
        # 1. Intent Detection
        # 2. Information Extraction
        # 3. Call ML/Weather Services based on intent
        # For now, we pass the user query and context directly to the LLM.
        
        reply = llm_service.generate_chat_response(request.message, context_str)
        
        return ChatResponse(
            reply=reply,
            session_id=session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
