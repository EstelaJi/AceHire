import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography, Input, Button, Space, Card, Tag, Select, Divider, Steps, Switch, message } from 'antd';
import { io, Socket } from 'socket.io-client';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

type Role = 'ai' | 'candidate';

type ConversationEntry = {
  role: Role;
  text: string;
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

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const mockInterviewQuestions: { minutes: number; text: string }[] = [
  { minutes: 3, text: '自我介绍与近期项目：你最近主导的一个全栈项目是什么？你的具体贡献？' },
  { minutes: 4, text: '架构权衡：在 Node/TS + React + PostgreSQL 的项目里，最有挑战的架构决策是什么？为什么这么选？放弃了哪些方案？' },
  { minutes: 4, text: 'API 设计：说一个你设计的接口（REST 或 GraphQL），如何做鉴权、幂等、防滥用（速率、重放）？' },
  { minutes: 4, text: '数据建模：在 PostgreSQL 里设计“用户-团队-权限”或“订单-支付”模型，如何处理约束（唯一性/外键）、索引策略、热点分区？' },
  { minutes: 4, text: '查询与性能：分享一次慢查询优化的经历（计划分析、索引/覆盖索引、分页策略、批量/管道化、缓存）。' },
  { minutes: 4, text: '事务与一致性：你如何选择隔离级别？遇到过死锁/幻读吗？怎么解决？（行级锁、悲观/乐观并发）' },
  { minutes: 4, text: '前端状态：在 React 中管理“列表 + 过滤 + 分页 + 权限”这类复杂状态，你用什么方案（React Query / Zustand / Redux），如何做请求去重与错误重试？' },
  { minutes: 4, text: '组件与性能：如何优化一个大型表格/列表（虚拟化、分块渲染、memo、选择性重渲染）？如何量化收益？' },
  { minutes: 3, text: '类型与可维护性：TypeScript 中你如何管理 API 类型（openapi/codegen/手写），以及防止 “any” 扩散？举例说明一次类型防回归的场景。' },
  { minutes: 3, text: '测试策略：你如何划分单测/集成/端到端测试？在全栈项目里如何对接口和 DB 进行可重复的测试（fixtures/事务回滚/testcontainers）？' },
  { minutes: 3, text: '安全与合规：Node/React 项目中如何防 XSS/CSRF/SQL 注入/SSR 相关风险？Secrets 管理和审计怎么做？' },
  { minutes: 3, text: '部署与可观测：描述你的交付流水线（lint/test/build/deploy），以及生产环境的日志/指标/链路追踪方案。复盘过的生产事故有哪些？' },
  { minutes: 2, text: '机动/快问快答：例如实现一个 TS promise 并发限制器，或一个防抖/节流 Hook（可口述思路）。' }
];

function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [industry, setIndustry] = useState<string>();
  const [level, setLevel] = useState<string>();
  const [step, setStep] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socket: Socket = useMemo(
    () =>
      io(backendUrl, {
        autoConnect: false,
        transports: ['websocket']
      }),
    [backendUrl]
  );

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('system:welcome', (payload: WelcomePayload) => setSessionId(payload?.sessionId || ''));
    socket.on('ai:message', (payload: AiMessagePayload) => {
      setConversation(prev => [...prev, { role: 'ai', text: payload.text }]);
      speakText(payload.text);
    });
    socket.on('interview:report', (payload: ReportPayload) => {
      setReport(payload);
      message.success('报告已生成');
    });
    socket.on('system:error', (err: ErrorPayload) => {
      message.error(err?.message || 'Server error');
    });
    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [socket]);

  const startInterview = () => {
    if (!industry || !level) {
      message.warning('Please select industry and job level');
      return;
    }
    socket.emit('interview:start', { industry, level });
    message.success('Interview context has been set');
    setStep(2);
  };

  const handleSendQuestion = () => {
    if (!industry || !level) {
      message.warning('Please select industry and job level and click "Start Interview"');
      return;
    }
    if (!question.trim()) return;
    const text = question.trim();
    setConversation(prev => [...prev, { role: 'candidate', text }]);
    socket.emit('candidate:text', { text });
    setQuestion('');
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = evt => {
        if (evt.data.size > 0) {
          socket.emit('candidate:audio', { blob: evt.data });
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      message.error('Cannot access microphone, please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const requestReport = () => {
    if (!sessionId) {
      message.warning('No session established, cannot generate report');
      return;
    }
    socket.emit('interview:report');
  };

  const loadMockInterview = () => {
    setStep(2);
    setConversation(prev => [
      ...prev,
      ...mockInterviewQuestions.map((q, idx) => ({
        role: 'ai' as Role,
        text: `Q${idx + 1} (${q.minutes}min): ${q.text}`
      }))
    ]);
    message.info('Loaded 45-minute full-stack mock interview plan.');
  };

  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US'; // 可根据需要切换 zh-CN
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const industryOptions = [
    { label: 'Internet/Software', value: 'internet' },
    { label: 'Finance', value: 'finance' },
    { label: 'Manufacturing/Industry', value: 'manufacturing' },
    { label: 'Healthcare/Medical', value: 'healthcare' },
    { label: 'Education', value: 'education' }
  ];

  const levelOptions = [
    { label: 'Intern', value: 'intern' },
    { label: 'Junior', value: 'junior' },
    { label: 'Mid', value: 'mid' },
    { label: 'Senior', value: 'senior' },
    { label: 'Lead/Manager', value: 'lead' }
  ];

  const steps = [
    { title: 'Ready', description: 'Ready to start' },
    { title: 'Select Direction', description: 'Industry and Job Level' },
    { title: 'Start Interview', description: 'Voice/Text Answer' },
    { title: 'Report', description: 'View Summary' }
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Title level={4} className="!mb-0">
            AI Mock Interviewer
          </Title>
          <Tag color={socketConnected ? 'green' : 'red'}>
            {socketConnected ? 'Online' : 'Offline'}
          </Tag>
          <Space size="small">
            <Text>AI Voice</Text>
            <Switch checked={ttsEnabled} onChange={setTtsEnabled} />
          </Space>
        </div>
      </Header>
      <Content className="p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Card className="text-center">
            {step === 0 ? (
              <Space direction="vertical" align="center" className="w-full">
                <Title level={3} className="!mb-2">
                  Practice Your Interview
                </Title>
                <Paragraph className="max-w-xl">
                  Ready to sharpen your skills? Choose your industry and level, then practice with voice or text. We will log Q&A and generate a report.
                </Paragraph>
                <Button type="primary" size="large" onClick={() => setStep(1)}>
                  Start a Practice Interview
                </Button>
                <Button onClick={loadMockInterview}>Load 45-min Mock (Full Stack: Node/TS/React/Postgres)</Button>
              </Space>
            ) : (
              <Steps current={step} items={steps} responsive />
            )}
          </Card>

          {step >= 1 && (
            <Card title="Interview Context">
              <Space direction="vertical" className="w-full">
                <Space wrap>
                  <Select
                    style={{ minWidth: 200 }}
                    placeholder="Select Industry"
                    options={industryOptions}
                    value={industry}
                    onChange={setIndustry}
                  />
                  <Select
                    style={{ minWidth: 200 }}
                    placeholder="Select Job Level"
                    options={levelOptions}
                    value={level}
                    onChange={setLevel}
                  />
                  <Button type="primary" onClick={startInterview}>
                    Start Interview
                  </Button>
                </Space>
                <Text type="secondary">Current Session: {sessionId || 'Not Connected'}</Text>
              </Space>
            </Card>
          )}

          {step >= 2 && (
            <Card className="lg:col-span-2" title="Real-time Conversation">
              <div className="space-y-3 mb-4 max-h-[520px] overflow-y-auto">
                {conversation.length === 0 && (
                  <Paragraph type="secondary">Start asking or recording, the AI interviewer will give feedback.</Paragraph>
                )}
                {conversation.map((item, idx) => (
                  <div key={idx} className="p-3 rounded border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <Text strong>{item.role === 'ai' ? 'AI 面试官' : '你'}</Text>
                      <Tag color={item.role === 'ai' ? 'blue' : 'geekblue'}>
                        {item.role === 'ai' ? 'AI' : 'Candidate'}
                      </Tag>
                    </div>
                    <Paragraph className="!mb-0">{item.text}</Paragraph>
                  </div>
                ))}
              </div>
              <Space.Compact className="w-full">
                <Input.TextArea
                  rows={3}
                  placeholder="Enter your answer or question..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onPressEnter={e => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendQuestion();
                    }
                  }}
                />
                <Button type="primary" onClick={handleSendQuestion} className="h-auto">
                  Send
                </Button>
              </Space.Compact>
              <Divider />
              <Space direction="vertical" className="w-full">
                <Button onClick={requestReport}>Generate Report</Button>
                {report && (
                  <Card size="small" title="Interview Report">
                    <Paragraph className="!mb-1">
                      Industry: {report.industry || '-'} · Level: {report.level || '-'}
                    </Paragraph>
                    <Paragraph className="!mb-1">Question Count: {report.questionCount}</Paragraph>
                    <Paragraph className="!mb-1">Answer Count: {report.answerCount}</Paragraph>
                    <Paragraph className="!mb-0">Summary: {report.summary}</Paragraph>
                  </Card>
                )}
              </Space>
            </Card>
          )}

          {step >= 2 && (
            <Card title="Audio Channel">
              <Space direction="vertical" className="w-full">
                <Paragraph type="secondary" className="!mb-1">
                  Click to start recording, the system will send the audio to the backend through Socket.IO and call the AI service.
                </Paragraph>
                <Space>
                  <Button type="primary" onClick={startRecording} disabled={isRecording}>
                    Start Recording
                  </Button>
                  <Button danger onClick={stopRecording} disabled={!isRecording}>
                    Stop Recording
                  </Button>
                </Space>
                <Tag color={isRecording ? 'processing' : 'default'}>
                  {isRecording ? 'Recording...' : 'Not Recording'}
                </Tag>
              </Space>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default App;

