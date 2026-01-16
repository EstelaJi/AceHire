import { Link } from "react-router-dom";
import { Button, Select, Card, Tag } from 'antd';
import { Sparkles, MessageSquare, FileText, TrendingUp, Filter, Code2 } from "lucide-react";
import { useState, useEffect } from 'react';
import { questions, Question } from './questionsData';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">InterviewPrep</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Practice Interviews with Confidence
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Prepare for your next job interview in a judgment-free environment. Get personalized feedback and improve
              your skills with AI-powered practice sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button type="primary" size="large">
                <Link to="/setup" style={{ color: 'inherit', textDecoration: 'none' }}>Start Practice Session</Link>
              </Button>
              <Button size="large">
                <Link to="/coding" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Code2 className="inline-block mr-2 size-4" />
                  Coding Interview
                </Link>
              </Button>
              <Button>
                <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 text-balance">
              Everything You Need to Succeed
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Text & Voice Practice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose your preferred practice mode. Switch between text and voice to build confidence in any format.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="size-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <FileText className="size-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Personalized Sessions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Select your industry and job level. Upload your resume for tailored questions that match your
                  experience.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="size-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Detailed Feedback</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive comprehensive reports after each session with actionable insights to improve your performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 text-balance">
              Simple Steps to Success
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Set Your Preferences</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose your industry, job level, and optionally upload your resume for more relevant questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Interview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Practice with realistic interview questions via text or voice in a comfortable, pressure-free
                    environment.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Review Your Report</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get detailed feedback on your responses, communication style, and areas for improvement.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button type="primary" size="large">
                <Link to="/setup" style={{ color: 'inherit', textDecoration: 'none' }}>Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 InterviewPrep. Practice with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
