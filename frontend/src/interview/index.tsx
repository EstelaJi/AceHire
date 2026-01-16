import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, message } from "antd";
import { io, Socket } from "socket.io-client";
import { Sparkles, Mic, MicOff, Square, Send } from "lucide-react";
import { AIAvatar } from "../components/ai-avatar";

// const { Header, Content } = Layout;
// const { Title, Paragraph, Text } = Typography;

type Message = {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

type Report = {
  industry?: string;
  level?: string;
  questionCount: number;
  answerCount: number;
  summary: string;
};

type WelcomePayload = { sessionId?: string };
type AiMessagePayload = { text: string };
type ReportPayload = Report;
type ErrorPayload = { message?: string };

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function InterviewPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [, setSocketConnected] = useState(false);
  const [industry, setIndustry] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [sessionId, setSessionId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const socket: Socket = useMemo(
    () =>
      io(backendUrl, {
        autoConnect: false,
        transports: ["websocket"],
      }),
    [backendUrl]
  );

  useEffect(() => {
    // Check if preferences exist
    const prefs = sessionStorage.getItem("interviewPrefs");
    if (!prefs) {
      navigate("/setup");
      return;
    }

    const { industry: prefIndustry, jobLevel: prefLevel } = JSON.parse(prefs);
    setIndustry(prefIndustry);
    setLevel(prefLevel);

    // Connect socket
    socket.connect();
    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("Socket connected");
    });
    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.log("Socket disconnected");
    });
    socket.on("system:welcome", (payload: WelcomePayload) => {
      const sid = payload?.sessionId || "";
      setSessionId(sid);
      console.log("Session ID:", sid);
    });
    socket.on("interview:report", (payload: ReportPayload) => {
      message.success("Interview completed! Generating report...");
      // Navigate to report page after a short delay
      setTimeout(() => {
        sessionStorage.setItem("interviewReport", JSON.stringify(payload));
        navigate("/report");
      }, 1500);
    });
    socket.on("ai:message", (payload: AiMessagePayload) => {
      const aiText = payload.text || "";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiText,
          timestamp: new Date(),
        },
      ]);
      speakText(aiText);
      // Auto scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    socket.on("candidate:text:ack", () => {
      // User's message was acknowledged, already added to messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    socket.on("system:error", (err: ErrorPayload) => {
      message.error(err?.message || "Server error");
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [socket, navigate]);

  const startInterview = () => {
    setIsInterviewStarted(true);
    // Start interview with backend
    socket.emit("interview:start", {
      industry,
      level,
    });
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (evt) => {
        if (evt.data.size > 0) {
          audioChunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        // Send all audio chunks to backend
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          // Convert Blob to ArrayBuffer for Socket.IO transmission
          const arrayBuffer = await audioBlob.arrayBuffer();
          socket.emit("candidate:audio", { blob: arrayBuffer });
          audioChunksRef.current = [];
        }
      };

      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      message.info("Recording started...");
    } catch (err) {
      message.error("Cannot access microphone, please check permissions.");
      console.error("Microphone access error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      message.info("Recording stopped, processing...");
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);

    // Send to backend
    socket.emit("candidate:text", { text });

    // Clear input
    setInputValue("");

    // Auto scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isRecording) {
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (!isVoiceMode) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const endInterview = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    // Request report from backend
    if (sessionId) {
      socket.emit("interview:report");
    } else {
      // Fallback: store interview data and navigate
      sessionStorage.setItem(
        "interviewData",
        JSON.stringify({
          messages,
          completedAt: new Date(),
          industry,
          level,
        })
      );
      navigate("/report");
    }
  };

  if (!isInterviewStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          {/* <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="size-8 text-primary" />
          </div> */}
          <div className="flex justify-center mb-4">
            <AIAvatar size="lg" isSpeaking={false} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Ready to Begin?
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Take a deep breath and relax. This is a practice session in a safe
            environment. You'll be asked a series of questions—answer naturally
            and at your own pace.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/setup")} className="flex-1">
              Go Back
            </Button>
            <Button type="primary" onClick={startInterview} className="flex-1">
              Start Interview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="size-5 text-primary-foreground" />
            </div> */}
            <AIAvatar size="sm" isSpeaking={true} />
            <span className="font-semibold text-lg text-foreground">
              InterviewPrep
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleVoiceMode}
              className={
                isVoiceMode ? "bg-primary text-primary-foreground" : ""
              }
            >
              {isVoiceMode ? (
                <Mic className="size-4 mr-2" />
              ) : (
                <MicOff className="size-4 mr-2" />
              )}
              {isVoiceMode ? "Voice" : "Text"}
            </Button>
            <Button onClick={endInterview}>End Interview</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="mr-3 mt-1">
                  <AIAvatar
                    size="md"
                    isSpeaking={index === messages.length - 1}
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-card-foreground"
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 bg-card border border-border rounded-xl p-4">
          {isVoiceMode ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Button
                type="primary"
                onClick={toggleRecording}
                className={`size-16 rounded-full ${
                  isRecording ? "bg-destructive hover:bg-destructive/90" : ""
                }`}
              >
                {isRecording ? (
                  <Square className="size-6" />
                ) : (
                  <Mic className="size-6" />
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? "Recording... Click to stop"
                  : "Click to start recording your answer"}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
    // <Layout className="min-h-screen">
    //   <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
    //     <div className="flex items-center gap-3">
    //       <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
    //         <Sparkles className="size-5 text-primary-foreground" />
    //       </div>
    //       <Title level={4} className="!mb-0">
    //         AI Mock Interviewer
    //       </Title>
    //       <Tag color={socketConnected ? 'green' : 'red'}>
    //         {socketConnected ? 'Online' : 'Offline'}
    //       </Tag>
    //       <Space size="small">
    //         <Text>AI Voice</Text>
    //         <Switch checked={ttsEnabled} onChange={setTtsEnabled} />
    //       </Space>
    //     </div>
    //     <Button onClick={() => navigate('/')}>Back to Home</Button>
    //   </Header>
    //   <Content className="p-6">
    //     <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
    //       <Card className="lg:col-span-2" title="Real-time Conversation">
    //         <div className="space-y-3 mb-4 max-h-[520px] overflow-y-auto">
    //           {conversation.length === 0 && (
    //             <Paragraph type="secondary">
    //               Start asking or recording, the AI interviewer will give feedback.
    //             </Paragraph>
    //           )}
    //           {conversation.map((item, idx) => (
    //             <div key={idx} className="p-3 rounded border border-slate-200 bg-white">
    //               <div className="flex items-center justify-between mb-1">
    //                 <Text strong>{item.role === 'ai' ? 'AI Interviewer' : 'You'}</Text>
    //                 <Tag color={item.role === 'ai' ? 'blue' : 'geekblue'}>
    //                   {item.role === 'ai' ? 'AI' : 'Candidate'}
    //                 </Tag>
    //               </div>
    //               <Paragraph className="!mb-0">{item.text}</Paragraph>
    //             </div>
    //           ))}
    //         </div>
    //         <Space.Compact className="w-full">
    //           <Input.TextArea
    //             rows={3}
    //             placeholder="Enter your answer or question..."
    //             value={question}
    //             onChange={e => setQuestion(e.target.value)}
    //             onPressEnter={e => {
    //               if (!e.shiftKey) {
    //                 e.preventDefault();
    //                 handleSendQuestion();
    //               }
    //             }}
    //           />
    //           <Button type="primary" onClick={handleSendQuestion} className="h-auto">
    //             Send
    //           </Button>
    //         </Space.Compact>
    //         <Divider />
    //         <Space direction="vertical" className="w-full">
    //           <Button onClick={requestReport}>Generate Report</Button>
    //           {report && (
    //             <Card size="small" title="Interview Report">
    //               <Paragraph className="!mb-1">
    //                 Industry: {report.industry || '-'} · Level: {report.level || '-'}
    //               </Paragraph>
    //               <Paragraph className="!mb-1">Question Count: {report.questionCount}</Paragraph>
    //               <Paragraph className="!mb-1">Answer Count: {report.answerCount}</Paragraph>
    //               <Paragraph className="!mb-0">Summary: {report.summary}</Paragraph>
    //             </Card>
    //           )}
    //         </Space>
    //       </Card>

    //       <Card title="Audio Channel">
    //         <Space direction="vertical" className="w-full">
    //           <Paragraph type="secondary" className="!mb-1">
    //             Click to start recording, the system will send the audio to the backend through Socket.IO and call the AI service.
    //           </Paragraph>
    //           <Space>
    //             <Button
    //               type="primary"
    //               onClick={startRecording}
    //               disabled={isRecording}
    //               icon={<Mic className="size-4" />}
    //             >
    //               Start Recording
    //             </Button>
    //             <Button
    //               danger
    //               onClick={stopRecording}
    //               disabled={!isRecording}
    //               icon={<MicOff className="size-4" />}
    //             >
    //               Stop Recording
    //             </Button>
    //           </Space>
    //           <Tag color={isRecording ? 'processing' : 'default'}>
    //             {isRecording ? 'Recording...' : 'Not Recording'}
    //           </Tag>
    //         </Space>
    //       </Card>
    //     </div>
    //   </Content>
    // </Layout>
  );
}
