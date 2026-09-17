import React, { useState, useEffect } from "react";
import { Card, Form, Input, InputNumber, Button, Divider, Avatar } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, WalletOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullname: user.fullname,
        email: user.email,
        mobile: user.mobile,
        monthlyBudget: user.monthlyBudget || 0,
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const { data } = await axios.put("/api/user/profile", {
        fullname: values.fullname,
        mobile: values.mobile,
        monthlyBudget: values.monthlyBudget,
      });

      if (data.user) {
        updateUser(data.user);
      }
      toast.success("Profile and budget target updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account & Budget Settings</h1>
        <p className="text-slate-500 text-sm">Manage your profile information and monthly spending limits.</p>
      </div>

      <Card className="shadow-sm border-slate-100 rounded-2xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
          <Avatar size={64} icon={<UserOutlined />} className="!bg-[#FF735C] text-2xl font-bold capitalize">
            {user?.fullname ? user.fullname[0] : "U"}
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-slate-800 capitalize m-0">{user?.fullname || "User"}</h2>
            <p className="text-slate-400 text-sm m-0">{user?.email}</p>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="fullname" label="Full Name" rules={[{ required: true, message: "Fullname is required" }]}>
              <Input prefix={<UserOutlined className="text-slate-400" />} />
            </Form.Item>

            <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true, message: "Contact number is required" }]}>
              <Input prefix={<PhoneOutlined className="text-slate-400" />} />
            </Form.Item>
          </div>

          <Form.Item name="email" label="Email Address">
            <Input prefix={<MailOutlined className="text-slate-400" />} disabled className="bg-slate-50 text-slate-500" />
          </Form.Item>

          <Divider />

          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
              <WalletOutlined className="text-[#FF735C]" /> Monthly Budget Target
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              Set a monthly spending limit to monitor your budget usage on the Dashboard.
            </p>

            <Form.Item name="monthlyBudget" label="Monthly Budget Limit (₹)">
              <InputNumber
                className="w-full"
                min={0}
                precision={2}
                placeholder="Enter monthly budget e.g. 25000"
              />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
              className="!bg-[#FF735C] hover:!bg-[#e55a43] !border-none !font-bold !h-10 !px-6"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
