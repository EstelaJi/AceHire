import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from typing import Dict, List

class SkillMatcher:
    def __init__(self):
        self.nlp = spacy.load("zh_core_web_sm")
        self.vectorizer = TfidfVectorizer(max_features=1000)
        
    def extract_skills(self, text: str) -> list:
        """Extract skills from text"""
        doc = self.nlp(text)
        
        # Define skill-related part-of-speech patterns
        skills = []
        skill_keywords = {
            "编程语言": ["Python", "Java", "JavaScript", "C++", "Go", "Rust"],
            "框架": ["React", "Vue", "Django", "Spring", "TensorFlow", "PyTorch"],
            "工具": ["Docker", "Kubernetes", "AWS", "Git", "Jenkins"],
            "技能": ["机器学习", "深度学习", "数据分析", "系统设计"]
        }
        
        # Extract skill entities
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "TECH"]:
                skills.append(ent.text)
        
        # Keyword matching
        for category, keywords in skill_keywords.items():
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    skills.append(keyword)
        
        return list(set(skills))
    
    def match_skills(self, resume_text: str, job_desc: str) -> Dict:
        """Match resume skills with job requirements"""
        # Extract skills
        resume_skills = self.extract_skills(resume_text)
        job_skills = self.extract_skills(job_desc)
        
        # Calculate matching degree
        all_skills = list(set(resume_skills + job_skills))
        skill_vectors = self.vectorizer.fit_transform(all_skills)
        
        # Calculate cosine similarity
        resume_vec = self.vectorizer.transform(resume_skills)
        job_vec = self.vectorizer.transform(job_skills)
        
        similarity = cosine_similarity(resume_vec, job_vec)
        
        # Calculate matching score
        matched_skills = []
        missing_skills = []
        
        for job_skill in job_skills:
            max_sim = 0
            best_match = None
            
            for i, resume_skill in enumerate(resume_skills):
                sim = similarity[i][job_skills.index(job_skill)]
                if sim > max_sim and sim > 0.6:  # Similarity threshold
                    max_sim = sim
                    best_match = resume_skill
            
            if best_match:
                matched_skills.append({
                    "required": job_skill,
                    "matched": best_match,
                    "confidence": round(max_sim, 2)
                })
            else:
                missing_skills.append(job_skill)
        
        return {
            "match_percentage": len(matched_skills) / max(len(job_skills), 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "resume_skills": resume_skills,
            "job_skills": job_skills
        }