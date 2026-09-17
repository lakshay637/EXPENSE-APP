import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  Card,
  Space,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health & Medical",
  "Salary",
  "Investment",
  "Freelance",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI / NetBanking", "Other"];

const Transactions = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10, totalItems: 0 });

  // Filter States
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);

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
          toast.success("✨ AI scanned payment paper & auto-filled today's transaction!");
        }
      } catch (err) {
        toast.error("Failed to scan payment paper");
      } finally {
        setScanning(false);
      }
    };
    return false;
  };

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: search.trim(),
        type,
        category,
        paymentMethod,
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const { data: res } = await axios.get("/api/expense", { params });
      setData(res.expenses || []);
      setPagination(res.pagination || { currentPage: page, limit: 10, totalItems: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [type, category, paymentMethod, dateRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setCategory("all");
    setPaymentMethod("all");
    setDateRange(null);
    fetchTransactions(1);
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get("/api/expense/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expenses_export_${dayjs().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      toast.error("Failed to export transactions CSV");
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: "expense",
      date: dayjs(),
      paymentMethod: "Cash",
      category: "Food & Dining",
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      title: record.title,
      amount: record.amount,
      type: record.type,
      category: record.category,
      paymentMethod: record.paymentMethod,
      date: dayjs(record.date),
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/expense/${id}`);
      toast.success("Transaction deleted successfully");
      fetchTransactions(pagination.currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete transaction");
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        date: values.date ? values.date.toISOString() : new Date().toISOString(),
      };

      if (editingItem) {
        await axios.put(`/api/expense/${editingItem._id}`, payload);
        toast.success("Transaction updated successfully!");
      } else {
        await axios.post("/api/expense", payload);
        toast.success("Transaction created successfully!");
      }

      setModalOpen(false);
      fetchTransactions(pagination.currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (d) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Title & Notes",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-semibold text-slate-800">{text}</div>
          {record.notes && <div className="text-xs text-slate-400 mt-0.5">{record.notes}</div>}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (t) => (
        <Tag color={t === "income" ? "green" : "volcano"} className="font-semibold uppercase text-xs">
          {t}
        </Tag>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 150,
      render: (pm) => <Tag color="geekblue">{pm}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 140,
      render: (amt, record) => (
        <span className={`font-bold text-base ${record.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
          {record.type === "income" ? "+" : "-"} ₹{Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined className="text-indigo-600" />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete transaction?"
            description="Are you sure you want to remove this record?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
          <p className="text-slate-500 text-sm">Manage, filter, and track all your income and daily expenses.</p>
        </div>
        <div className="flex gap-3">
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV} className="!border-slate-300">
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
            className="!bg-[#FF735C] hover:!bg-[#e55a43] !border-none !font-bold"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm border-slate-100 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Search Keywords</label>
            <Input
              placeholder="Search title or notes..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearchSubmit}
              allowClear
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
            <Select
              className="w-full"
              value={type}
              onChange={setType}
              options={[
                { label: "All Types", value: "all" },
                { label: "Expenses", value: "expense" },
                { label: "Income", value: "income" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <Select
              className="w-full"
              value={category}
              onChange={setCategory}
              options={[
                { label: "All Categories", value: "all" },
                ...CATEGORIES.map((c) => ({ label: c, value: c })),
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Method</label>
            <Select
              className="w-full"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { label: "All Methods", value: "all" },
                ...PAYMENT_METHODS.map((pm) => ({ label: pm, value: pm })),
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date Range</label>
            <RangePicker className="w-full" value={dateRange} onChange={setDateRange} format="YYYY-MM-DD" />
          </div>
        </form>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Button type="primary" icon={<FilterOutlined />} onClick={() => fetchTransactions(1)} className="!bg-indigo-600">
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Main Transactions Table */}
      <Card className="shadow-sm border-slate-100 rounded-xl">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.limit,
            total: pagination.totalItems,
            onChange: (page) => fetchTransactions(page),
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} transactions`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={<span className="font-bold text-lg text-slate-800">{editingItem ? "Edit Transaction" : "Add New Transaction"}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {!editingItem && (
          <div className="mb-4 p-4 bg-indigo-50/70 border border-dashed border-indigo-300 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
              ✨ Upload Payment Paper / Receipt (AI Auto-Fill)
            </div>
            <p className="text-slate-500 text-xs mb-3">Upload a photo of your receipt or bill paper to automatically fill today's entry.</p>
            <input
              type="file"
              accept="image/*,.pdf"
              id="receipt-upload-tx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleReceiptScan(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="receipt-upload-tx"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all"
            >
              {scanning ? "AI Scanning Payment Paper..." : "📷 Choose Payment Paper Photo"}
            </label>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Form.Item name="type" label="Transaction Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Expense", value: "expense" },
                { label: "Income", value: "income" },
              ]}
            />
          </Form.Item>

          <Form.Item name="title" label="Title / Description" rules={[{ required: true, message: "Please enter title" }]}>
            <Input placeholder="e.g. Electricity Bill, Coffee, Freelance Payment" />
          </Form.Item>

          <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: "Please enter amount" }]}>
            <InputNumber className="w-full" min={0.01} precision={2} placeholder="0.00" />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
          </Form.Item>

          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="paymentMethod" label="Payment Method">
            <Select options={PAYMENT_METHODS.map((pm) => ({ label: pm, value: pm }))} />
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea rows={2} placeholder="Additional comments..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="!bg-[#FF735C]">
              {editingItem ? "Update Transaction" : "Save Transaction"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions;
