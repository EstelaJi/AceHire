import os
# Disable MPS backend to avoid compatibility issues on macOS
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "0"
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"

import torch
# Explicitly disable MPS if available
if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
    torch.backends.mps.is_available = lambda: False

import torchaudio
import torch.nn as nn
from typing import Dict, List
from transformers import Wav2Vec2ForSequenceClassification

class VoiceAnalysis:
    def __init__(self):
        # Explicitly use CPU to avoid MPS issues on macOS
        self.device = "cpu"
        
        # Voice emotion analysis model
        self.emotion_model = Wav2Vec2ForSequenceClassification.from_pretrained(
            "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
        ).to(self.device)
        
        # Voice quality detection (placeholder - not implemented yet)
        self.speech_rate_model = None
    
    def analyze_emotion(self, audio_path: str) -> Dict:
        """Analyze emotion in voice"""
        waveform, sample_rate = torchaudio.load(audio_path)
        
        # Preprocessing
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(sample_rate, 16000)
            waveform = resampler(waveform)
        
        # Move waveform to device
        waveform = waveform.to(self.device)
        
        # Emotion classification
        with torch.no_grad():
            outputs = self.emotion_model(waveform)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
        emotions = {
            "calm": predictions[0][0].item(),
            "happy": predictions[0][1].item(),
            "sad": predictions[0][2].item(),
            "angry": predictions[0][3].item(),
            "fearful": predictions[0][4].item(),
            "disgust": predictions[0][5].item(),
            "surprised": predictions[0][6].item(),
            "neutral": predictions[0][7].item()
        }
        
        return {
            "dominant_emotion": max(emotions, key=emotions.get),
            "confidence": max(emotions.values()),
            "all_emotions": emotions
        }
    
    def analyze_speech_patterns(self, audio_path: str, transcript: str) -> Dict:
        """Analyze speech patterns"""
        # Calculate speech rate
        words_per_minute = self._calculate_speech_rate(audio_path, transcript)
        
        # Detect filler words
        filler_words = self._detect_filler_words(transcript)
        
        # Analyze pause pattern
        pause_pattern = self._analyze_pauses(audio_path)
        
        return {
            "speech_rate": words_per_minute,
            "filler_words": filler_words,
            "pause_frequency": pause_pattern["frequency"],
            "average_pause_duration": pause_pattern["average_duration"],
            "confidence_indicator": self._calculate_confidence_indicator(
                words_per_minute, filler_words, pause_pattern
            )
        }
    
    def _load_speech_rate_model(self):
        """Placeholder for speech rate model loading"""
        return None
    
    def _calculate_speech_rate(self, audio_path: str, transcript: str) -> float:
        """Calculate words per minute from transcript"""
        # Simple calculation: word count / duration estimate
        words = len(transcript.split())
        # Estimate duration (rough approximation)
        # Average speaking rate is about 150 words per minute
        # For now, return a default value
        return 120.0  # Default WPM
    
    def _detect_filler_words(self, transcript: str) -> List[str]:
        """Detect filler words in transcript"""
        filler_words_list = ["um", "uh", "er", "ah", "like", "you know", "嗯", "那个", "就是"]
        found = []
        transcript_lower = transcript.lower()
        for filler in filler_words_list:
            if filler in transcript_lower:
                found.append(filler)
        return found
    
    def _analyze_pauses(self, audio_path: str) -> Dict:
        """Analyze pause patterns in audio"""
        # Placeholder implementation
        return {
            "frequency": 5.0,  # pauses per minute
            "average_duration": 1.0  # seconds
        }
    
    def _calculate_confidence_indicator(self, wpm: float, 
                                       fillers: list, 
                                       pauses: Dict) -> float:
        """Calculate confidence indicator"""
        score = 100
        
        # Speech rate adjustment (normal range 120-150wpm)
        if wpm < 100:
            score -= (100 - wpm) * 0.5
        elif wpm > 180:
            score -= (wpm - 180) * 0.3
            
        # Filler words deduction
        score -= len(fillers) * 2
        
        # Pause deduction
        if pauses["frequency"] > 10:  # Pause more than 10 times per minute
            score -= 10
        if pauses["average_duration"] > 2.0:  # Average pause more than 2 seconds
            score -= 5
            
        return max(0, min(100, score))