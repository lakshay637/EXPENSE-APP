import React, { useState, useEffect } from "react";
import { Drawer, Button, Input, Tag, Progress, Card, Spin } from "antd";
import {
  RobotOutlined,
  SendOutlined,
  BulbOutlined,
  AlertOutlined,
  RiseOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";

const AIAdvisor = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const fetchAIInsights = async (userQuery = "") => {
    try {
      setLoading(true);
      const { data: res } = await axios.post("/api/expense/ai-advisor", {
        userPrompt: userQuery,
      });
      setData(res);

      if (userQuery && res.aiReply) {
        setChatHistory((prev) => [
          ...prev,
          { sender: "user", text: userQuery },
          { sender: "ai", text: res.aiReply },
        ]);
      }
    } catch (err) {
      toast.error("Failed to generate AI insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAIInsights();
    }
  }, [open]);

  const handleSendPrompt = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const q = prompt;
    setPrompt("");
    fetchAIInsights(q);
  };

  const { healthScore = 70, topLeak = "None", topLeakAmount = 0, tips = [] } = data || {};

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg">
          <RobotOutlined className="text-xl text-[#FF735C]" /> AI Financial Advisor ✨
        </div>
      }
      placement="right"
      width={420}
      onClose={onClose}
      open={open}
      className="rounded-l-2xl"
    >
      {loading && !data ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="AI analyzing your transactions..." />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Health Score Card */}
          <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none rounded-2xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Financial Health Score
                </p>
                <h3 className="text-3xl font-extrabold mt-1 text-emerald-400">{healthScore} / 100</h3>
                <p className="text-xs text-slate-300 mt-1">Based on savings velocity & budget limits.</p>
              </div>
              <Progress
                type="circle"
                percent={healthScore}
                width={65}
                strokeColor={healthScore >= 75 ? "#10B981" : healthScore >= 50 ? "#F59E0B" : "#EF4444"}
                format={(p) => <span className="text-white text-xs font-bold">{p}%</span>}
              />
            </div>
          </Card>

          {/* Top Leak Card */}
          {topLeak !== "None" && (
            <Card className="border-amber-100 bg-amber-50/50 rounded-xl p-0 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertOutlined className="text-amber-600 text-lg mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm m-0">Top Expense Category</h4>
                  <p className="text-xs text-amber-800 m-0 mt-0.5">
                    Highest category spending is in <span className="font-bold">{topLeak}</span> (₹
                    {topLeakAmount.toLocaleString()}).
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* AI Tips */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2">
              <BulbOutlined className="text-amber-500" /> Smart Recommendations
            </h4>
            <div className="space-y-2">
              {tips.map((tip, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-700">
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">AI Assistant Conversation</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white ml-6 text-right"
                        : "bg-slate-100 text-slate-800 mr-6"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSendPrompt} className="pt-3 border-t border-slate-100">
            <Input.Search
              placeholder="Ask AI e.g. How can I save ₹5,000?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              enterButton={<Button type="primary" icon={<SendOutlined />} className="!bg-[#FF735C]" />}
              onSearch={(val) => {
                if (val.trim()) {
                  setPrompt("");
                  fetchAIInsights(val);
                }
              }}
              loading={loading}
            />
          </form>
        </div>
      )}
    </Drawer>
  );
};

export default AIAdvisor;
