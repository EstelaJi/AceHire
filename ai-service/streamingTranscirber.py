import queue
import threading
from faster_whisper import WhisperModel

class StreamingTranscriber:
    def __init__(self, model_size: str = "base"):
        # 使用faster-whisper提高性能
        self.model = WhisperModel(
            model_size, 
            device="cuda", 
            compute_type="float16"
        )
        self.audio_queue = queue.Queue()
        self.result_queue = queue.Queue()
        
    def start_streaming(self, sample_rate: int = 16000):
        """启动流式转录线程"""
        def process_stream():
            segments, info = self.model.transcribe(
                self.audio_generator(),
                language="zh",
                beam_size=5,
                vad_filter=True,  # 语音活动检测
                vad_parameters=dict(
                    min_silence_duration_ms=500,
                    threshold=0.5
                )
            )
            
            for segment in segments:
                self.result_queue.put({
                    "text": segment.text,
                    "start": segment.start,
                    "end": segment.end,
                    "confidence": segment.avg_logprob
                })
                
        threading.Thread(target=process_stream, daemon=True).start()
        
    def audio_generator(self):
        """音频生成器"""
        while True:
            chunk = self.audio_queue.get()
            if chunk is None:
                break
            yield chunk