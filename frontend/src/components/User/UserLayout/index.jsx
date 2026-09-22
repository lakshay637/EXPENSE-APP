import { useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import React, { useState } from "react";
import {
  AppstoreAddOutlined,
  BarChartOutlined,
  MenuOutlined,
  LogoutOutlined,
  TransactionOutlined,
  UserOutlined,
  RobotOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { Layout, Image, Menu, Button, Avatar, Tooltip, Spin } from "antd";
import { useAuth } from "../../../context/AuthContext";
import AIAdvisor from "../AIAdvisor";
import CalculatorModal from "../Calculator";

const { Sider, Content, Header } = Layout;

const items = [
  {
    key: "/app/user/dashboard",
    label: "Dashboard",
    icon: <AppstoreAddOutlined />,
  },
  {
    key: "/app/user/transactions",
    label: "Transactions",
    icon: <TransactionOutlined />,
  },
  {
    key: "/app/user/reports",
    label: "Reports",
    icon: <BarChartOutlined />,
  },
  {
    key: "/app/user/profile",
    label: "Profile & Settings",
    icon: <UserOutlined />,
  },
];

const UserLayout = () => {
  const siderStyle = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, loading, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const handlenavigate = (menu) => {
    navigate(menu.key);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleApplyCalcAmount = (amount) => {
    navigate("/app/user/transactions", { state: { prefillAmount: amount, openModal: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" tip="Loading User Workspace..." />
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout className="!min-h-screen">
      <Sider style={siderStyle} collapsible collapsed={open} onCollapse={(value) => setOpen(value)}>
        <div className="p-4">
          <div className="flex justify-center items-center my-4">
            <Image
              src="/exp-img.jpg"
              width={45}
              height={45}
              alt="logo"
              className="rounded-full !text-center mx-auto"
              fallback="https://via.placeholder.com/45"
            />
          </div>
          <Menu
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={["/app/user/dashboard"]}
            theme="dark"
            items={items}
            onClick={handlenavigate}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={headerStyle} className="!bg-white !h-16 !leading-normal !px-4 md:!px-8 justify-between flex items-center !shadow-xs border-b border-slate-200/90">
          <Button onClick={() => setOpen(!open)} icon={<MenuOutlined />} />
          
          <div className="flex items-center gap-3">
            <Button
              icon={<CalculatorOutlined className="!text-indigo-600 font-bold" />}
              onClick={() => setCalcOpen(true)}
              className="!border-indigo-200 hover:!border-indigo-400 !text-slate-700 !font-semibold shadow-2xs"
            >
              Calculator 🧮
            </Button>

            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={() => setAiOpen(true)}
              className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-none !font-semibold shadow-sm"
            >
              Ask AI ✨
            </Button>

            <div className="hidden sm:flex items-center gap-2 cursor-pointer ml-2" onClick={() => navigate("/app/user/profile")}>
              <Avatar className="!bg-[#FF735C] font-bold">
                {user?.fullname ? user.fullname[0].toUpperCase() : "U"}
              </Avatar>
              <span className="font-semibold text-slate-700 capitalize">{user?.fullname || "User"}</span>
            </div>
            <Tooltip title="Logout">
              <Button danger icon={<LogoutOutlined />} onClick={handleLogout} />
            </Tooltip>
          </div>
        </Header>

        <Content className="p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-64px)]">
          <Outlet />
        </Content>

        <AIAdvisor open={aiOpen} onClose={() => setAiOpen(false)} />
        <CalculatorModal
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          onApplyToTransaction={handleApplyCalcAmount}
        />
      </Layout>
    </Layout>
  );
};

export default UserLayout;

