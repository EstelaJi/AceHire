import torch
import torchaudio
import torch.nn as nn
from typing import Dict, List
from transformers import Wav2Vec2ForSequenceClassification

class VoiceAnalysis:
    def __init__(self):
        # 语音情感分析模型
        self.emotion_model = Wav2Vec2ForSequenceClassification.from_pretrained(
            "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
        )
        
        # 语音质量检测
        self.speech_rate_model = self._load_speech_rate_model()
    
    def analyze_emotion(self, audio_path: str) -> Dict:
        """分析语音中的情感"""
        waveform, sample_rate = torchaudio.load(audio_path)
        
        # 预处理
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(sample_rate, 16000)
            waveform = resampler(waveform)
        
        # 情感分类
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
        """分析语音模式"""
        # 计算语速
        words_per_minute = self._calculate_speech_rate(audio_path, transcript)
        
        # 检测填充词
        filler_words = self._detect_filler_words(transcript)
        
        # 分析停顿模式
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
    
    def _calculate_confidence_indicator(self, wpm: float, 
                                       fillers: list, 
                                       pauses: Dict) -> float:
        """计算自信度指标"""
        score = 100
        
        # 语速调整（正常范围120-150wpm）
        if wpm < 100:
            score -= (100 - wpm) * 0.5
        elif wpm > 180:
            score -= (wpm - 180) * 0.3
            
        # 填充词扣分
        score -= len(fillers) * 2
        
        # 停顿扣分
        if pauses["frequency"] > 10:  # 每分钟停顿超过10次
            score -= 10
        if pauses["average_duration"] > 2.0:  # 平均停顿超过2秒
            score -= 5
            
        return max(0, min(100, score))