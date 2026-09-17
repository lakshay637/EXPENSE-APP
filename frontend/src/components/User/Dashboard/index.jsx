import React, { useEffect, useState } from "react";
import { Card, Button, Progress, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Table, Spin } from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  DollarOutlined,
  PieChartOutlined,
  RiseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useAuth } from "../../../context/AuthContext";

const CATEGORY_COLORS = {
  "Food & Dining": "#FF6B6B",
  "Transportation": "#4D96FF",
  "Shopping": "#FFD93D",
  "Bills & Utilities": "#6BCB77",
  "Entertainment": "#9D4EDD",
  "Health & Medical": "#FF922C",
  "Salary": "#2EC4B6",
  "Investment": "#3A86EF",
  "Freelance": "#F72585",
  "Other": "#8D99AE",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/expense/stats");
      setStats(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddTransaction = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        date: values.date ? values.date.toISOString() : new Date().toISOString(),
      };
      await axios.post("/api/expense", payload);
      toast.success("Transaction added successfully!");
      setModalOpen(false);
      form.resetFields();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading Dashboard..." />
      </div>
    );
  }

  const { summary, categoryStats = [], dailyTrend = [], recentTransactions = [] } = stats || {};
  const { netBalance = 0, totalIncome = 0, totalExpense = 0, currentMonthExpense = 0, monthlyBudget = 0 } = summary || {};

  const pieData = categoryStats.map((item) => ({
    name: item._id,
    value: item.totalAmount,
    color: CATEGORY_COLORS[item._id] || "#8884d8",
  }));

  const budgetPercent = monthlyBudget > 0 ? Math.min(Math.round((currentMonthExpense / monthlyBudget) * 100), 100) : 0;
  const isBudgetExceeded = monthlyBudget > 0 && currentMonthExpense > monthlyBudget;

  const recentColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <span className="font-semibold text-gray-800">{text}</span>
          {record.notes && <p className="text-xs text-gray-400 m-0">{record.notes}</p>}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d) => dayjs(d).format("MMM DD, YYYY"),
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (pm) => <Tag color="default">{pm}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amt, record) => (
        <span className={`font-bold ${record.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
          {record.type === "income" ? "+" : "-"} ₹{Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  const handleReceiptScan = (file) => {
    setScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const { data: res } = await axios.post("/api/expense/scan-receipt", {
          image: base64Data,
          filename: file.name,
        });

        if (res.success && res.extracted) {
          const { title, amount, category, date, paymentMethod, notes, type } = res.extracted;
          form.setFieldsValue({
            title,
            amount,
            category,
            paymentMethod,
            notes,
            type: type || "expense",
            date: date ? dayjs(date) : dayjs(),
          });
          toast.success("✨ AI scanned payment paper & auto-filled transaction!");
        }
      } catch (err) {
        toast.error("Failed to scan payment paper");
      } finally {
        setScanning(false);
      }
    };
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] text-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight m-0 text-white">
            Welcome back, <span className="text-[#FF735C] capitalize">{user?.fullname || "User"}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1 m-0">Here's your daily financial overview and smart insights.</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          className="!bg-[#FF735C] hover:!bg-[#e55a43] !border-none !font-bold !h-12 !px-6 rounded-xl shadow-md shrink-0"
        >
          New Transaction
        </Button>
      </div>

      {/* Monthly Budget Alert Bar */}
      {monthlyBudget > 0 && (
        <Card className="shadow-xs border-slate-200/80 rounded-xl bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {isBudgetExceeded ? (
                <ExclamationCircleOutlined className="text-red-500 text-lg" />
              ) : (
                <WalletOutlined className="text-indigo-600 text-lg" />
              )}
              <span className="font-semibold text-slate-800 text-sm">
                Monthly Budget Usage: ₹{currentMonthExpense.toLocaleString()} / ₹{monthlyBudget.toLocaleString()}
              </span>
            </div>
            <span className={`font-bold text-sm ${isBudgetExceeded ? "text-red-500" : "text-indigo-600"}`}>
              {budgetPercent}% Used
            </span>
          </div>
          <Progress
            percent={budgetPercent}
            status={isBudgetExceeded ? "exception" : "active"}
            strokeColor={isBudgetExceeded ? "#EF4444" : "#6366F1"}
            showInfo={false}
          />
        </Card>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="shadow-xs border-slate-200/80 rounded-2xl bg-white hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 m-0">Total Net Balance</p>
              <h3 className={`text-2xl font-black mt-1 m-0 ${netBalance >= 0 ? "text-slate-900" : "text-red-600"}`}>
                ₹{netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg border border-indigo-100">
              <WalletOutlined />
            </div>
          </div>
        </Card>

        <Card className="shadow-xs border-slate-200/80 rounded-2xl bg-white hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 m-0">Total Income</p>
              <h3 className="text-2xl font-black mt-1 m-0 text-emerald-600">
                +₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg border border-emerald-100">
              <ArrowUpOutlined />
            </div>
          </div>
        </Card>

        <Card className="shadow-xs border-slate-200/80 rounded-2xl bg-white hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 m-0">Total Expenses</p>
              <h3 className="text-2xl font-black mt-1 m-0 text-red-500">
                -₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-lg border border-red-100">
              <ArrowDownOutlined />
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow Area Chart */}
        <Card title={<div className="flex items-center gap-2 text-slate-800 font-bold"><RiseOutlined /> 30-Day Cashflow Trend</div>} className="lg:col-span-7 shadow-sm border-slate-100 rounded-2xl">
          <div className="h-72 w-full">
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(val) => [`₹${val}`, ""]} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No recent trends available. Add transactions to visualize history.
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card title={<div className="flex items-center gap-2 text-slate-800 font-bold"><PieChartOutlined /> Expenses by Category</div>} className="lg:col-span-5 shadow-sm border-slate-100 rounded-2xl">
          <div className="h-72 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-center">No expense categories recorded yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card title={<span className="font-bold text-slate-800">Recent Transactions</span>} className="shadow-sm border-slate-100 rounded-2xl">
        <Table
          columns={recentColumns}
          dataSource={recentTransactions}
          rowKey="_id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        title={<span className="font-bold text-lg text-slate-800">Add New Transaction</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {/* AI Receipt Dropzone */}
        <div className="mb-4 p-4 bg-indigo-50/70 border border-dashed border-indigo-300 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            ✨ Upload Payment Paper / Receipt (AI Auto-Fill)
          </div>
          <p className="text-slate-500 text-xs mb-3">Upload a photo of your receipt or bill paper to automatically fill today's entry.</p>
          <input
            type="file"
            accept="image/*,.pdf"
            id="receipt-upload-dash"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleReceiptScan(e.target.files[0]);
              }
            }}
          />
          <label
            htmlFor="receipt-upload-dash"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all"
          >
            {scanning ? "AI Scanning Payment Paper..." : "📷 Choose Payment Paper Photo"}
          </label>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTransaction}
          initialValues={{
            type: "expense",
            date: dayjs(),
            paymentMethod: "Cash",
            category: "Food & Dining",
          }}
        >
          <Form.Item name="type" label="Transaction Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Expense", value: "expense" },
                { label: "Income", value: "income" },
              ]}
            />
          </Form.Item>

          <Form.Item name="title" label="Title / Description" rules={[{ required: true, message: "Please enter title" }]}>
            <Input placeholder="e.g. Grocery shopping, Salary deposit" />
          </Form.Item>

          <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: "Please enter amount" }]}>
            <InputNumber className="w-full" min={0.01} precision={2} placeholder="0.00" />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Food & Dining", value: "Food & Dining" },
                { label: "Transportation", value: "Transportation" },
                { label: "Shopping", value: "Shopping" },
                { label: "Bills & Utilities", value: "Bills & Utilities" },
                { label: "Entertainment", value: "Entertainment" },
                { label: "Health & Medical", value: "Health & Medical" },
                { label: "Salary", value: "Salary" },
                { label: "Investment", value: "Investment" },
                { label: "Freelance", value: "Freelance" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Form.Item>

          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="paymentMethod" label="Payment Method">
            <Select
              options={[
                { label: "Cash", value: "Cash" },
                { label: "Credit Card", value: "Credit Card" },
                { label: "Debit Card", value: "Debit Card" },
                { label: "UPI / NetBanking", value: "UPI / NetBanking" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea rows={2} placeholder="Add any additional remarks..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="!bg-[#FF735C]">
              Save Transaction
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
