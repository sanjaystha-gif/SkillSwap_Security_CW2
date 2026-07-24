import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Landing Page (TODO)</div>} />
      <Route path="/skills" element={<div>Browse Skills (TODO)</div>} />
      <Route path="/login" element={<div>Login (TODO)</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
