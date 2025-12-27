import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, List


class AnswerEvaluator:
    """
    使用交叉编码器 reranker 评估回答：
    - relevance: 问题 vs 回答 的相关性
    - completeness: 回答对预期要点的覆盖度（逐点打分取均值）
    - depth/clarity: 简单基于长度与句子数的启发式（可后续接 LLM 细化）
    """

    def __init__(self, model_name: str = "BAAI/bge-reranker-v2-m3", device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name).to(self.device)
        self.scoring_weights = {
            "relevance": 0.35,
            "completeness": 0.35,
            "depth": 0.15,
            "clarity": 0.15,
        }

    def evaluate_answer(self, question: str, answer: str, expected_points: List[str]) -> Dict:
        relevance = self._rerank_score(question, answer)
        completeness = self._coverage_score(answer, expected_points)
        depth = self._depth_score(answer)
        clarity = self._clarity_score(answer)

        scores = {
            "relevance": round(relevance, 3),
            "completeness": round(completeness, 3),
            "depth": round(depth, 3),
            "clarity": round(clarity, 3),
        }
        total = sum(scores[k] * self.scoring_weights[k] for k in scores)
        return {
            "total_score": round(total * 10, 1),  # 10 分制
            "detailed_scores": scores,
            "feedback": self._generate_feedback(scores),
        }

    def _rerank_score(self, query: str, doc: str) -> float:
        inputs = self.tokenizer(
            query,
            doc,
            return_tensors="pt",
            truncation=True,
            max_length=512,
        ).to(self.device)
        with torch.no_grad():
            logits = self.model(**inputs).logits
            prob = F.softmax(logits, dim=1)[0, 1]
        return float(prob)  # 0-1

    def _coverage_score(self, answer: str, expected_points: List[str]) -> float:
        if not expected_points:
            return 0.5
        scores = [self._rerank_score(p, answer) for p in expected_points]
        return float(sum(scores) / len(scores))

    def _depth_score(self, answer: str) -> float:
        # 简单启发式：长度和“因为/例如”等词的出现
        length = len(answer.split())
        bonus = 0.1 if any(k in answer.lower() for k in ["because", "例如", "比如", "for example"]) else 0
        score = min(1.0, (length / 80.0) + bonus)
        return max(0.0, score)

    def _clarity_score(self, answer: str) -> float:
        sentences = max(1, answer.count(".") + answer.count("。") + answer.count("!") + answer.count("?"))
        avg_len = len(answer.split()) / sentences
        # 过短或过长都会减分
        if avg_len < 5:
            return 0.4
        if avg_len > 40:
            return 0.6
        return 0.8

    def _generate_feedback(self, scores: Dict[str, float]) -> str:
        parts = []
        if scores["relevance"] < 0.6:
            parts.append("需要更聚焦于问题本身。")
        if scores["completeness"] < 0.6:
            parts.append("回答未覆盖关键要点，补充更多细节。")
        if scores["depth"] < 0.6:
            parts.append("缺少深入的原理或案例说明。")
        if scores["clarity"] < 0.6:
            parts.append("表达需更简洁、有条理。")
        return " ".join(parts) or "回答整体较好，保持当前深度与清晰度。"