import { Card, Form, Button, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState} from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import HomeLayout from "../../../layout/HomeLayout";
import { useEffect } from "react";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const { Item } = Form;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [forgetForm] = Form.useForm();
  const [rePasswordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [devResetLink, setDevResetLink] = useState(null);

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
      setDevResetLink(null);
      const { data } = await axios.post("/api/user/forgot-password", values);
      toast.success(data.message || "Please check your email to reset your password");
      if (data.resetLink) {
        setDevResetLink(data.resetLink);
      }
    } catch (err) {
      const message = err.response ? err.response.data.message : err.message;
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
      <div className="flex">
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <img
            src="/exp-img.jpg"
            alt="Tracking Expenses"
            className="w-4/5 object-contain"
          />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-6 bg-white">
          <Card className="w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-[#FF735C] Text-2xl text-center mb-6">
              {
                token ?
                "Change Password"
                :
                "Forgot Password"
              }
            </h2>
            {token ? (
              <Form
                name="Login-form"
                layout="vertical"
                onFinish={onChangePassword}
                form={rePasswordForm}
              >
                <Item
                  name="password"
                  label="New Password"
                  rules={[{ required: true, message: "Please enter new password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter new password"
                  />
                </Item>
                <Item
                  name="re-password"
                  label="Re-enter Password"
                  rules={[{ required: true, message: "Please confirm new password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm new password"
                  />
                </Item>
                <Item>
                  <Button
                    type="text"
                    htmlType="submit"
                    block
                    className="!bg-[#FF735C] !text-white !font-bold"
                    loading={loading}
                  >
                    Change Password
                  </Button>
                </Item>
              </Form>
            ) : (
              <Form
                name="Login-form"
                layout="vertical"
                onFinish={onFinish}
                form={forgetForm}
              >
                <Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                  <Input prefix={<UserOutlined />} placeholder="Enter registered email" />
                </Item>
                <Item>
                  <Button
                    type="text"
                    htmlType="submit"
                    block
                    className="!bg-[#FF735C] !text-white !font-bold"
                    loading={loading}
                  >
                    Submit
                  </Button>
                </Item>

                {devResetLink && (
                  <div className="my-3 p-3 bg-amber-50 border border-amber-200 rounded text-center text-xs">
                    <p className="font-semibold text-amber-800 mb-1">Dev Reset Link Generated:</p>
                    <a href={devResetLink} className="text-indigo-600 underline font-bold break-all">
                      Click here to reset password
                    </a>
                  </div>
                )}
              </Form>
            )}
            <ToastContainer />
            <div className="flex items-center justify-between">
              <Link
                style={{ textDecoration: "underline" }}
                to="/"
                className="!text-[#FF735C] !font-bold"
              >
                Sign in
              </Link>
              <Link
                style={{ textDecoration: "underline" }}
                to="/signup"
                className="!text-[#FF735C] !font-bold"
              >
                Don't have an account?
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
};
export default ForgotPassword;
