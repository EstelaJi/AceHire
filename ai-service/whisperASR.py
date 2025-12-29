# requirements.txt
# openai-whisper>=20231117
# torch>=2.0
# transformers>=4.30

import whisper
import numpy as np
from typing import Optional, Dict
import asyncio

class WhisperASR:
    def __init__(self, model_size: str = "base", device: str = "cuda"):
        """
        初始化Whisper模型
        model_size: tiny, base, small, medium, large
        """
        self.model = whisper.load_model(model_size, device=device)
        self.device = device
        
    async def transcribe_realtime(
        self, 
        audio_stream, 
        language: Optional[str] = "zh",
        initial_prompt: Optional[str] = None
    ) -> Dict:
        """Real-time transcribe audio stream"""
        options = {
            "language": language,
            "task": "transcribe",
            "initial_prompt": initial_prompt,
            "fp16": self.device == "cuda",
            "temperature": 0.0,
            "best_of": 5,
            "beam_size": 5,
            "without_timestamps": False,
        }
        
        result = await asyncio.to_thread(
            self.model.transcribe,
            audio_stream,
            **options
        )
        return result
    
    def transcribe_file(self, audio_path: str) -> Dict:
        """Transcribe audio file"""
        result = self.model.transcribe(audio_path)
        return {
            "text": result["text"],
            "segments": result["segments"],
            "language": result.get("language", "zh")
        }