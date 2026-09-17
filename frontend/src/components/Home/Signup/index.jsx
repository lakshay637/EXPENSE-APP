import React, { useState } from "react";
import { Card, Form, Button, Input } from "antd";
import { LockOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeLayout from "../../../layout/HomeLayout";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const { Item } = Form;

const Signup = () => {
  const [signupForm] = Form.useForm();

  const [formValues, setFormValues] = useState(null);
  const [serverOtp, setServerOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/user/send-mail", values);
      setFormValues(values);
      signupForm.resetFields();
      setServerOtp(data.otp || null);
      toast.success(data.message || "OTP sent");
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Send failed";
      toast.error(msg);
      setServerOtp(null);
      setFormValues(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async ({ otp }) => {
    if (!serverOtp) {
      toast.error("No OTP to verify");
      return;
    }
    if (String(otp).trim() !== String(serverOtp).trim()) {
      toast.error("Invalid OTP");
      return;
    }

    try {
      setLoading(true);
      // create user after OTP verified
      await axios.post("/api/user/signup", formValues);
      toast.success("Signup successful");
      setServerOtp(null);
      setFormValues(null);
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 py-4">
        {/* Left Info */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            🚀 Quick 1-Minute Registration
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Start Tracking Your <span className="text-emerald-600">Daily Wealth</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-md font-medium">
            Join thousands of users organizing their daily expenses, building budget goals, and getting AI insights.
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

        {/* Right Signup Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Card className="w-full max-w-md !bg-white !border-slate-200/80 shadow-xl rounded-2xl p-2 md:p-4">
            <div className="text-center mb-6">
              <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">
                Create an Account
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">Register to start managing your daily budget</p>
            </div>

            <ToastContainer />

            {!serverOtp ? (
              <Form name="otp-form" layout="vertical" onFinish={sendOtp}>
                <Item
                  name="fullname"
                  label={<span className="text-slate-700 text-xs font-semibold">Full Name</span>}
                  rules={[{ required: true, message: "Please enter your fullname" }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="Enter your Full Name"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                  />
                </Item>

                <Item
                  name="mobile"
                  label={<span className="text-slate-700 text-xs font-semibold">Contact Number</span>}
                  rules={[{ required: true, message: "Please enter contact number" }]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400" />}
                    placeholder="Enter your Contact Number"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                  />
                </Item>

                <Item
                  name="email"
                  label={<span className="text-slate-700 text-xs font-semibold">Email Address</span>}
                  rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
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
                  rules={[{ required: true, message: "Please enter password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Create a password"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 rounded-xl"
                  />
                </Item>

                <Item className="mt-4">
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    block
                    className="!bg-gradient-to-r !from-emerald-600 !to-emerald-500 !text-white !font-bold !h-12 rounded-xl !border-none hover:opacity-95 shadow-md"
                  >
                    Send Verification OTP
                  </Button>
                </Item>
              </Form>
            ) : (
              <Form
                name="signup-form"
                layout="vertical"
                onFinish={verifyOtp}
                form={signupForm}
              >
                <div className="mb-4 text-center">
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-semibold">
                    OTP sent to your email
                  </span>
                </div>

                <Item
                  name="otp"
                  label={<span className="text-slate-700 text-xs font-semibold">Enter OTP Code</span>}
                  rules={[{ required: true, message: "Please enter the OTP" }]}
                >
                  <Input
                    placeholder="Enter 6-digit OTP"
                    className="!bg-slate-50 !border-slate-300 !text-slate-900 !h-11 text-center font-mono text-lg rounded-xl tracking-widest"
                  />
                </Item>

                <Item className="mt-4">
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    block
                    className="!bg-gradient-to-r !from-[#FF735C] !to-[#E55A43] !text-white !font-bold !h-12 rounded-xl !border-none shadow-md"
                  >
                    Verify OTP & Create Account
                  </Button>
                </Item>

                {serverOtp && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center text-xs text-indigo-900 my-2 font-medium">
                    🔑 Dev Helper OTP: <span className="font-bold text-indigo-700 font-mono">{serverOtp}</span>
                  </div>
                )}
              </Form>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 text-xs font-semibold">
              <Link
                to="/"
                className="!text-[#FF735C] hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
};
export default Signup;
