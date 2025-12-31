import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import HomePage from './home';
import SetupPage from './setup';
import InterviewPage from './interview';
import ReportPage from './report';
import QuestionBankUnifiedPage from './question-bank-unified';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'rgb(107, 114, 255)', 
        },
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/question-bank" element={<QuestionBankUnifiedPage />} />
        <Route path="/question-bank/all" element={<QuestionBankUnifiedPage />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
