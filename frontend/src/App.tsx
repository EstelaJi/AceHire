import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import HomePage from './home';
import SetupPage from './setup';
import InterviewPage from './interview';
import ReportPage from './report';

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
      </Routes>
    </ConfigProvider>
  );
}

export default App;
