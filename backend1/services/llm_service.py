import openai
from core.config import settings

# Initialize OpenAI client to point to local LLM (e.g., Ollama, vLLM, LM Studio)
client = openai.OpenAI(
    base_url=settings.LLM_API_BASE,
    api_key=settings.LLM_API_KEY
)

def generate_chat_response(prompt: str, context: str = "") -> str:
    """
    Generate a response using the local Qwen model.
    """
    system_prompt = (
        "You are an AI-powered agriculture assistant for farmers in Odisha called Krushi Shayaka. "
        "Provide helpful, practical, and location-specific agricultural guidance based on the context provided. "
        "Keep your answers clear, concise, and easy for a farmer to understand."
    )
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if context:
        messages.append({"role": "system", "content": f"Relevant Context:\n{context}"})
        
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=settings.LLM_MODEL_NAME,
            messages=messages,
            temperature=0.3, # Low temperature for more factual responses
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return "Sorry, I am currently unable to process your request. Please ensure the local AI model is running."

def extract_intent_and_entities(user_message: str):
    """
    In a full implementation, you would use function calling or a structured output prompt 
    to extract intents (e.g., 'CROP_RECOMMENDATION') and entities (e.g., 'Cuttack', 'pH 6.5').
    For now, this is a placeholder.
    """
    pass
