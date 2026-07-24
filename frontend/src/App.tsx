import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Skills from './pages/Skills';
import SkillDetail from './pages/SkillDetail';
import SkillEdit from './pages/SkillEdit';
import MySkills from './pages/MySkills';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import CreateSkill from './pages/CreateSkill';
import InitiateSwap from './pages/InitiateSwap';
import Swaps from './pages/Swaps';
import Credits from './pages/Credits';
import Login from './pages/Login';
import Register from './pages/Register';

function App(): JSX.Element {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skills" element={<Skills />} />
          <Route
            path="/skills/create"
            element={
              <ProtectedRoute>
                <CreateSkill />
              </ProtectedRoute>
            }
          />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route
            path="/skills/:id/edit"
            element={
              <ProtectedRoute>
                <SkillEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-skills"
            element={
              <ProtectedRoute>
                <MySkills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/users/:userId" element={<UserProfile />} />
          <Route
            path="/swaps/initiate/:skillId"
            element={
              <ProtectedRoute>
                <InitiateSwap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/swaps"
            element={
              <ProtectedRoute>
                <Swaps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/credits"
            element={
              <ProtectedRoute>
                <Credits />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
