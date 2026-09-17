import Homepage from "./components/Home";
import Signup from "./components/Home/Signup";
import Pagenotfound from "./components/Pagenotfound";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./components/User/UserLayout";
import ForgotPassword from "./components/Home/ForgotPassword";
import Dashboard from "./components/User/Dashboard";
import Transactions from "./components/User/Transactions";
import Reports from "./components/User/Reports";
import Profile from "./components/User/Profile";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/app/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/app/user/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/*" element={<Pagenotfound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;