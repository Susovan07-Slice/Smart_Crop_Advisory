import os
import requests
import json
from typing import Dict, Any, List, Optional
from core.config import settings

class OllamaClient:
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5:14b") # Often mapped as qwen2.5:14b or similar. We will default to what the user requested, but standard ollama naming applies.
        # Fallback to general qwen naming if needed
        self.model = os.getenv("OLLAMA_MODEL", "qwen:14b")

    def check_health(self) -> bool:
        """Check if Ollama is running."""
        try:
            res = requests.get(f"{self.base_url}/api/version", timeout=3)
            return res.status_code == 200
        except Exception:
            return False
            
    def list_models(self) -> List[str]:
        """List available models in Ollama."""
        try:
            res = requests.get(f"{self.base_url}/api/tags", timeout=3)
            if res.status_code == 200:
                data = res.json()
                return [m.get("name") for m in data.get("models", [])]
            return []
        except Exception:
            return []

    def ensure_model(self):
        """Checks if the configured model is available."""
        available = self.list_models()
        # Loose match in case of tag differences (e.g., qwen:14b vs qwen:14b-instruct)
        if any(self.model in m for m in available):
            return True
        if "qwen" in str(available).lower():
            # If the exact model isn't there but a qwen is, let's try to adapt or just let it fail gracefully later
            pass
        return available

    def generate_chat_response(self, system_prompt: str, user_message: str, history: List[Dict] = None, temperature: float = 0.2, max_tokens: int = 1000) -> str:
        """
        Generates a chat response from the local Ollama model.
        """
        messages = [{"role": "system", "content": system_prompt}]
        
        if history:
            messages.extend(history)
            
        messages.append({"role": "user", "content": user_message})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        
        try:
            res = requests.post(f"{self.base_url}/api/chat", json=payload, timeout=60)
            if res.status_code == 200:
                data = res.json()
                return data.get("message", {}).get("content", "")
            else:
                print(f"Ollama error: {res.text}")
                return "I'm sorry, my local reasoning engine encountered an error."
        except requests.exceptions.ConnectionError:
            return "Error: Cannot connect to the local AI engine (Ollama). Please ensure it is running."
        except requests.exceptions.Timeout:
            return "Error: The local AI engine timed out while thinking."
        except Exception as e:
            return f"Error: An unexpected issue occurred communicating with the local AI. ({str(e)})"

ollama_client = OllamaClient()
