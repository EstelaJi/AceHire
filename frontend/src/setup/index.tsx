import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, Select, Input, Space, Typography } from "antd";
import { ArrowLeft, Upload, X, Sparkles } from "lucide-react";

const industries = [
  { label: "Technology", value: "technology" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Education", value: "education" },
  { label: "Consulting", value: "consulting" },
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Human Resources", value: "hr" },
];

const jobLevels = [
  { label: "Entry Level", value: "entry" },
  { label: "Junior", value: "junior" },
  { label: "Mid-Level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
  { label: "Manager", value: "manager" },
  { label: "Director", value: "director" },
  { label: "Executive", value: "executive" },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState<string>("");
  const [jobLevel, setJobLevel] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
  };

  const handleStartInterview = () => {
    if (industry && jobLevel) {
      // Store preferences in sessionStorage
      sessionStorage.setItem(
        "interviewPrefs",
        JSON.stringify({
          industry,
          jobLevel,
          hasResume: !!resumeFile,
        })
      );
      navigate("/interview");
    }
  };

  const isValid = industry && jobLevel;

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
            <Link to="/" style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
              Set Up Your Interview
            </h1>
            <p className="text-muted-foreground text-lg text-pretty">
              Help us personalize your practice session for the best experience
            </p>
          </div>

          <Card className="border-border shadow-sm">
            <div>
              <Typography.Title level={3}>
                Interview Preferences
              </Typography.Title>
              <Typography.Paragraph>
                Choose your industry and experience level to get relevant
                questions
              </Typography.Paragraph>
            </div>
            <Space direction="vertical" className="w-full" size="large">
              <div>
                <label
                  htmlFor="industry"
                  className="block mb-2 text-sm font-medium"
                >
                  Industry *
                </label>
                <Select
                  id="industry"
                  style={{ width: "100%" }}
                  placeholder="Select your industry"
                  value={industry}
                  onChange={setIndustry}
                  options={industries}
                />
              </div>

              <div>
                <label
                  htmlFor="job-level"
                  className="block mb-2 text-sm font-medium"
                >
                  Job Level *
                </label>
                <Select
                  id="job-level"
                  style={{ width: "100%" }}
                  placeholder="Select your experience level"
                  value={jobLevel}
                  onChange={setJobLevel}
                  options={jobLevels}
                />
              </div>

              <div>
                <span className="block mb-2 text-sm font-medium">
                  Resume (Optional)
                </span>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload your resume for more personalized questions
                </p>

                {!resumeFile ? (
                  <label
                    htmlFor="resume"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="size-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                    <Input
                      id="resume"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-primary/10 flex items-center justify-center">
                        <Upload className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(resumeFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRemoveFile}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <Button className="flex-1">
                  <Link
                    to="/"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    Cancel
                  </Link>
                </Button>
                <Button
                  type="primary"
                  onClick={handleStartInterview}
                  disabled={!isValid}
                  className="flex-1"
                >
                  Start Interview
                </Button>
              </div>
            </Space>
          </Card>
        </div>
      </main>
    </div>
  );
}
