import { Card, Form, Button, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
if (import.meta.env.VITE_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
}

const { Item } = Form;

const Login = () => {

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [loginForm] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/user/login", values);
      const { role, token, user } = data;
      if (token && user) {
        authLogin(token, user);
      }
      if(role === "admin")
        return toast.success("Admin try to login");
      if(role === "user" || !role)
        return navigate("/app/user/dashboard");
    } catch (err) {
      const errMsg = err.response
        ? (err.response.data?.message || `Server error (${err.response.status})`)
        : (err.message === "Network Error" || !import.meta.env.VITE_BASE_URL
            ? "Cannot connect to backend server. Ensure backend is deployed & VITE_BASE_URL is set in Netlify."
            : err.message);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 py-4">
        {/* Left Showcase */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            ✨ AI-Powered Financial Tracking
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Take Control of Your <span className="text-[#FF735C]">Daily Expenses</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-md font-medium">
            Smart category breakdowns, 30-day cash flow trends, budget alerts, and AI insights designed to accelerate your savings.
          </p>

          <div className="hidden md:flex items-center justify-center pt-2">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-md max-w-sm">
              <img
                src="/exp-img.jpg"
                alt="Tracking Expenses"
                className="w-full object-contain rounded-xl"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Card className="w-full max-w-md !bg-white !border-slate-200/80 shadow-xl rounded-2xl p-2 md:p-4">
            <div className="text-center mb-6">
              <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">Log in to manage your budget & transactions</p>
            </div>

            <Form
              name="Login-form"
              layout="vertical"
              onFinish={onFinish}
              form={loginForm}
            >
              <Item
                name="email"
                label={<span className="text-slate-700 text-xs font-semibold">Email or Username</span>}
                rules={[{ required: true, message: "Please enter your username/email" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="Enter your email"
                  className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                />
              </Item>

              <Item
                name="password"
                label={<span className="text-slate-700 text-xs font-semibold">Password</span>}
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Enter your password"
                  className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                />
              </Item>

              <Item className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="!bg-gradient-to-r !from-[#FF735C] !to-[#E55A43] !text-white !font-bold !h-12 rounded-xl !border-none hover:opacity-95 shadow-md"
                  loading={loading}
                >
                  Log In to Dashboard
                </Button>
              </Item>
            </Form>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold">
              <Link
                to="/forgot-password"
                className="!text-[#FF735C] hover:underline"
              >
                Forgot Password?
              </Link>
              <Link
                to="/signup"
                className="!text-indigo-600 hover:underline"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
export default Login;
