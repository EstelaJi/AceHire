import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button, Card, Progress, Typography } from "antd";
import {
  Sparkles,
  Home,
  RotateCcw,
  TrendingUp,
  MessageSquare,
  Clock,
} from "lucide-react";

type ReportData = {
  overallScore: number;
  communicationScore: number;
  contentScore: number;
  confidenceScore: number;
  duration: string;
  questionsAnswered: number;
  strengths: string[];
  improvements: string[];
};

export default function ReportPage() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    // Check if interview data exists
    const data = sessionStorage.getItem("interviewData");
    if (!data) {
      navigate("/setup");
      return;
    }

    // Generate mock report data
    const mockReport: ReportData = {
      overallScore: 78,
      communicationScore: 82,
      contentScore: 75,
      confidenceScore: 77,
      duration: "12 minutes",
      questionsAnswered: 5,
      strengths: [
        "Clear and concise responses",
        "Good use of specific examples",
        "Positive and enthusiastic tone",
      ],
      improvements: [
        "Provide more quantifiable achievements",
        "Structure answers using the STAR method",
        "Expand on technical skills and tools",
      ],
    };

    setReportData(mockReport);
  }, []);

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="size-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Generating your report...</p>
        </div>
      </div>
    );
  }

  const ScoreCard = ({
    title,
    score,
    icon: Icon,
  }: {
    title: string;
    score: number;
    icon: any;
  }) => (
    <Card>
      <div className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-base">{title}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Progress percent={score} className="h-2" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">
              InterviewPrep
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
              Interview Report
            </h1>
            <p className="text-muted-foreground text-lg">
              Great job completing your practice session!
            </p>
          </div>

          {/* Overall Score */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <div>
              <div className="text-2xl">Overall Performance</div>
              <span>Your aggregate score across all dimensions</span>
            </div>
            <div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">
                    {reportData.overallScore}
                  </span>
                  <span className="text-xl text-muted-foreground">/ 100</span>
                </div>
                <Progress percent={reportData.overallScore} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  You're performing well! Keep practicing to improve even
                  further.
                </p>
              </div>
            </div>
          </Card>

          {/* Session Stats */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <div className="pt-6 flex items-center gap-4">
                <div className="size-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <MessageSquare className="size-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {reportData.questionsAnswered}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Questions Answered
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="pt-6 flex items-center gap-4">
                <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="size-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {reportData.duration}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Session Duration
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Scores */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Detailed Breakdown
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <ScoreCard
                title="Communication"
                score={reportData.communicationScore}
                icon={MessageSquare}
              />
              <ScoreCard
                title="Content Quality"
                score={reportData.contentScore}
                icon={TrendingUp}
              />
              <ScoreCard
                title="Confidence"
                score={reportData.confidenceScore}
                icon={Sparkles}
              />
            </div>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-secondary/30 bg-secondary/5">
              <div>
                <Typography.Title level={4} className="text-lg">Your Strengths</Typography.Title>
                <Typography.Paragraph className="text-muted-foreground">What you did well</Typography.Paragraph>
              </div>
              <div>
                <ul className="space-y-3">
                  {reportData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="size-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-secondary text-xs font-semibold">
                          ✓
                        </span>
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="border-accent/30 bg-accent/5">
              <div>
                <Typography.Title level={4} className="text-lg">Areas to Improve</Typography.Title>
                <Typography.Paragraph className="text-muted-foreground">Focus on these for next time</Typography.Paragraph>
              </div>
              <div>
                <ul className="space-y-3">
                  {reportData.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="size-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-accent text-xs font-semibold">
                          !
                        </span>
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">
                        {improvement}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="primary" className="items-center justify-center flex-1 h-[40px]">
              <Link to="/setup" className="flex items-center justify-center">
                <RotateCcw className="size-4 mr-2" />
                Practice Again
              </Link>
            </Button>
            <Button className="flex-1 bg-transparent h-[40px]">
              <Link to="/" className="flex items-center justify-center">
                <Home className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
