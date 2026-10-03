import { Card, Form, Button, Input } from "antd";
import { LockOutlined, UserOutlined, KeyOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HomeLayout from "../../../layout/HomeLayout";

if (import.meta.env.VITE_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
}

const { Item } = Form;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [forgetForm] = Form.useForm();
  const [rePasswordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tok = params.get("token");
    if (tok) {
      setToken(tok);
    } else {
      setToken(null);
    }
  }, [params]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/user/forgot-password", values, { timeout: 15000 });
      toast.success(data.message || "Please check your email to reset your password");
    } catch (err) {
      let message = err.response?.data?.message || err.message;
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        message = "Server connection timeout. Please try again.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values) => {
    const { password, "re-password": rePassword } = values;
    if (password !== rePassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/user/reset-password", {
        token,
        password,
      });
      toast.success(data.message || "Password updated successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      const message = err.response ? err.response.data.message : err.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <ToastContainer />
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 py-4">
        {/* Left Info Showcase */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            🔑 Account Security & Recovery
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Reset Your <span className="text-[#FF735C]">Account Password</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-md font-medium">
            Enter your registered email address and we'll send you an instant reset link to regain access to your dashboard.
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

        {/* Right Form Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Card className="w-full max-w-md !bg-white !border-slate-200/80 shadow-xl rounded-2xl p-2 md:p-4">
            <div className="text-center mb-6">
              <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">
                {token ? "Set New Password" : "Forgot Password?"}
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                {token
                  ? "Create a strong new password for your account"
                  : "We'll email you a secure link to reset your password"}
              </p>
            </div>

            {token ? (
              <Form
                name="ResetPassword-form"
                layout="vertical"
                onFinish={onChangePassword}
                form={rePasswordForm}
              >
                <Item
                  name="password"
                  label={<span className="text-slate-700 text-xs font-semibold">New Password</span>}
                  rules={[{ required: true, message: "Please enter new password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Enter new password"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                  />
                </Item>

                <Item
                  name="re-password"
                  label={<span className="text-slate-700 text-xs font-semibold">Confirm Password</span>}
                  rules={[{ required: true, message: "Please confirm new password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Confirm new password"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                  />
                </Item>

                <Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="!bg-gradient-to-r !from-[#FF735C] !to-[#E55A43] !text-white !font-bold !h-12 rounded-xl !border-none shadow-md"
                    loading={loading}
                  >
                    Change Password
                  </Button>
                </Item>
              </Form>
            ) : (
              <Form
                name="ForgotPassword-form"
                layout="vertical"
                onFinish={onFinish}
                form={forgetForm}
              >
                <Item
                  name="email"
                  label={<span className="text-slate-700 text-xs font-semibold">Registered Email</span>}
                  rules={[{ required: true, type: "email", message: "Please enter your registered email" }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="name@example.com"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                  />
                </Item>

                <Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="!bg-gradient-to-r !from-[#FF735C] !to-[#E55A43] !text-white !font-bold !h-12 rounded-xl !border-none shadow-md"
                    loading={loading}
                  >
                    Send Reset Link
                  </Button>
                </Item>
              </Form>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold">
              <Link to="/" className="!text-[#FF735C] hover:underline">
                Back to Sign In
              </Link>
              <Link to="/signup" className="!text-indigo-600 hover:underline">
                Don't have an account? Sign up
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
};

export default ForgotPassword;
