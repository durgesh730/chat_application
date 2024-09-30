import Dashboard from "./pages";
import Login from "./features/auth/Login";
import Profile from "./features/auth/Profile";
import Register from "./features/auth/Register";
import ProtectedRoute from "./features/ProtectedRoute";
import NotFound from "./component/ui/notFound/NotFound";
import ForgotPassword from "./features/auth/ForgotPassword";
import ChangePassword from "./features/auth/ChangePassword";
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot/password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ChangePassword />} />
        <Route path="/" element={
          <ProtectedRoute >
            <Dashboard />
          </ProtectedRoute>}
        />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
