import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Spin } from "antd";
import { BarChartOutlined, DownloadOutlined, TrophyOutlined, FilePdfOutlined } from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useAuth } from "../../../context/AuthContext";
import { downloadTransactionsPDF } from "../../../utils/pdfGenerator";

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/expense/stats");
      setStats(data);
    } catch (err) {
      toast.error("Failed to load reports analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await axios.get("/api/expense/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial_report_${dayjs().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully!");
    } catch (err) {
      toast.error("Failed to export report");
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Generating PDF report...");
      const { data: res } = await axios.get("/api/expense", { params: { limit: 1000 } });
      const transactions = res.expenses || [];

      downloadTransactionsPDF(transactions, {
        userName: user?.fullname || "User",
        reportTitle: "Analytics & Spending Financial Statement",
        summaryStats: stats?.summary || null,
      });
      toast.success("📄 Financial PDF Report downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download PDF report");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Generating Reports..." />
      </div>
    );
  }

  const { summary, categoryStats = [] } = stats || {};
  const { totalIncome = 0, totalExpense = 0, netBalance = 0 } = summary || {};

  const comparisonData = [
    {
      name: "Financial Totals",
      Income: totalIncome,
      Expense: totalExpense,
      Savings: Math.max(0, netBalance),
    },
  ];

  const categoryTableColumns = [
    {
      title: "Category",
      dataIndex: "_id",
      key: "category",
      render: (cat) => <Tag color="indigo" className="text-sm py-1 px-3 font-semibold">{cat}</Tag>,
    },
    {
      title: "Total Transactions",
      dataIndex: "count",
      key: "count",
      align: "center",
      render: (cnt) => <span className="font-semibold text-slate-700">{cnt}</span>,
    },
    {
      title: "Total Spent (₹)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amt) => (
        <span className="font-bold text-red-500">
          ₹{Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "% of Total Expenses",
      dataIndex: "totalAmount",
      key: "percentage",
      align: "right",
      render: (amt) => {
        const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
        return <span className="font-bold text-indigo-600">{pct}%</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Reports & Analytics</h1>
          <p className="text-slate-500 text-sm">Deep-dive analysis into your overall spending distribution and net cash flow.</p>
        </div>
        <div className="flex gap-3">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="!border-slate-300"
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
            className="!bg-[#FF735C] hover:!bg-[#e55a43] !border-none !font-bold"
          >
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Comparison Chart */}
      <Card title={<div className="flex items-center gap-2 font-bold text-slate-800"><BarChartOutlined /> Income vs Expense Comparison</div>} className="shadow-sm border-slate-100 rounded-2xl">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="Income" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Savings" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Category Spending Breakdown */}
      <Card title={<div className="flex items-center gap-2 font-bold text-slate-800"><TrophyOutlined className="text-amber-500" /> Category Breakdown</div>} className="shadow-sm border-slate-100 rounded-2xl">
        <Table
          columns={categoryTableColumns}
          dataSource={categoryStats}
          rowKey="_id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Reports;
