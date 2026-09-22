import React, { useState, useEffect } from "react";
import { Modal, Tabs, Input, Button, Card, Tag, Tooltip, Slider, Space } from "antd";
import {
  CalculatorOutlined,
  UsergroupAddOutlined,
  PercentageOutlined,
  BankOutlined,
  CopyOutlined,
  CheckOutlined,
  PlusCircleOutlined,
  HistoryOutlined,
  DeleteOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

// Safe Math Expression Evaluator
const evaluateExpression = (expr) => {
  if (!expr || typeof expr !== "string") return "";
  try {
    // Sanitize string to allow only numbers, operators, brackets, decimals, and whitespace
    const sanitized = expr.replace(/[^0-9+\-*/%.() ]/g, "");
    if (!sanitized.trim()) return "";
    
    // Convert percentage like 50% to (50/100)
    const formatted = sanitized.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

    // Evaluate using Function constructor in a restricted scope
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${formatted})`)();
    
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      // Round to 4 decimal places max to avoid floating point anomalies like 0.30000000000000004
      return Math.round(result * 10000) / 10000;
    }
    return "";
  } catch (e) {
    return "";
  }
};

const CalculatorModal = ({ open, onClose, onApplyToTransaction }) => {
  const [activeTab, setActiveTab] = useState("1");

  // --- TAB 1: Standard & Expression Calculator State ---
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Computed result for Tab 1
  const liveResult = evaluateExpression(expression);

  const handleAppend = (val) => {
    setExpression((prev) => prev + val);
  };

  const handleClear = () => {
    setExpression("");
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    const res = evaluateExpression(expression);
    if (res !== "" && String(res) !== expression) {
      const newEntry = {
        id: Date.now(),
        expr: expression,
        result: res,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 19)]);
      setExpression(String(res));
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (amountVal) => {
    const num = Number(amountVal);
    if (isNaN(num) || num <= 0) {
      toast.error("Invalid amount to apply");
      return;
    }
    if (onApplyToTransaction) {
      onApplyToTransaction(num);
      onClose();
      toast.success(`₹${num} applied to Transaction Form!`);
    }
  };

  // Keyboard Listener for Standard Calculator
  useEffect(() => {
    if (!open || activeTab !== "1") return;

    const handleKeyDown = (e) => {
      // Ignore if user is inside an input box elsewhere
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      const key = e.key;
      if (/[0-9+\-*/.()]/.test(key)) {
        e.preventDefault();
        setExpression((prev) => prev + key);
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, activeTab, expression]);

  // --- TAB 2: Bill Splitter State ---
  const [billTotal, setBillTotal] = useState(1000);
  const [peopleCount, setPeopleCount] = useState(3);
  const [tipPercent, setTipPercent] = useState(10);

  const tipAmount = (billTotal * tipPercent) / 100;
  const grandTotalBill = billTotal + tipAmount;
  const perPersonShare = peopleCount > 0 ? grandTotalTotalBill => grandTotalBill / peopleCount : 0;
  const perPersonAmount = peopleCount > 0 ? Math.round((grandTotalBill / peopleCount) * 100) / 100 : 0;

  // --- TAB 3: Tax / GST & Discount State ---
  const [taxAmount, setTaxAmount] = useState(5000);
  const [ratePercent, setRatePercent] = useState(18);
  const [taxMode, setTaxMode] = useState("addTax"); // 'addTax', 'removeTax', 'discount'

  let calculatedValue = 0;
  let finalPrice = 0;

  if (taxMode === "addTax") {
    calculatedValue = (taxAmount * ratePercent) / 100;
    finalPrice = taxAmount + calculatedValue;
  } else if (taxMode === "removeTax") {
    finalPrice = taxAmount / (1 + ratePercent / 100);
    calculatedValue = taxAmount - finalPrice;
  } else if (taxMode === "discount") {
    calculatedValue = (taxAmount * ratePercent) / 100;
    finalPrice = taxAmount - calculatedValue;
  }

  // --- TAB 4: EMI Calculator State ---
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(12);

  // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const r = interestRate / 12 / 100;
  const n = tenureMonths;
  const emiVal =
    r > 0 && n > 0
      ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : principal / (n || 1);

  const monthlyEMI = Math.round(emiVal * 100) / 100;
  const totalPayment = Math.round(monthlyEMI * n * 100) / 100;
  const totalInterest = Math.round((totalPayment - principal) * 100) / 100;

  const keypadButtons = [
    ["C", "(", ")", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "%", "="],
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
          <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <CalculatorOutlined />
          </span>
          Inbuilt Financial & Quick Calculator
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnClose
      className="calculator-modal"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="mt-2 font-medium"
        items={[
          {
            key: "1",
            label: (
              <span className="flex items-center gap-1.5">
                <CalculatorOutlined /> Standard
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                {/* Expression Input & Display Box */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-inner border border-slate-800 space-y-2">
                  <div className="text-right text-slate-400 text-sm font-mono overflow-x-auto min-h-[24px]">
                    {expression || "0"}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">
                      Live Result
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {liveResult !== "" ? `₹ ${liveResult.toLocaleString("en-IN")}` : "₹ 0"}
                    </span>
                  </div>
                </div>

                {/* Keypad Grid & History Panel Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left 2 Cols: Keypad Buttons */}
                  <div className="md:col-span-2 grid grid-cols-4 gap-2">
                    {keypadButtons.flat().map((btn, idx) => {
                      let btnStyle = "bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold";
                      if (btn === "C") btnStyle = "bg-red-500 hover:bg-red-600 text-white font-bold";
                      else if (["/", "*", "-", "+", "="].includes(btn))
                        btnStyle = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold";
                      else if (["(", ")", "%"].includes(btn))
                        btnStyle = "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold";

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (btn === "C") handleClear();
                            else if (btn === "=") handleCalculate();
                            else handleAppend(btn);
                          }}
                          className={`h-12 rounded-xl text-lg flex items-center justify-center transition-all duration-150 active:scale-95 shadow-xs ${btnStyle}`}
                        >
                          {btn}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right 1 Col: History Tape */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between max-h-[260px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <HistoryOutlined /> History
                      </span>
                      {history.length > 0 && (
                        <button
                          onClick={() => setHistory([])}
                          className="text-[11px] text-red-500 hover:underline flex items-center gap-0.5"
                        >
                          <DeleteOutlined /> Clear
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin">
                      {history.length === 0 ? (
                        <div className="text-slate-400 text-center py-8 text-[11px] italic">
                          Calculations history will appear here.
                        </div>
                      ) : (
                        history.map((h) => (
                          <div
                            key={h.id}
                            onClick={() => setExpression(String(h.result))}
                            className="bg-white p-2 rounded-xl border border-slate-200/60 cursor-pointer hover:border-indigo-400 transition-all shadow-2xs"
                          >
                            <div className="text-slate-500 text-[10px] font-mono">{h.expr}</div>
                            <div className="font-bold text-slate-800 text-right font-mono text-xs">
                              = {h.result}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer for Tab 1 */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <Button
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => handleCopy(liveResult !== "" ? liveResult : expression)}
                    disabled={!expression && liveResult === ""}
                  >
                    {copied ? "Copied" : "Copy Result"}
                  </Button>

                  {onApplyToTransaction && (
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() => handleApply(liveResult !== "" ? liveResult : expression)}
                      disabled={!liveResult && (!expression || isNaN(Number(expression)))}
                      className="!bg-[#FF735C] hover:!bg-[#e55a43] !border-none !font-bold"
                    >
                      Use in Transaction
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "2",
            label: (
              <span className="flex items-center gap-1.5">
                <UsergroupAddOutlined /> Split Bill
              </span>
            ),
            children: (
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Total Bill (₹)</label>
                    <Input
                      type="number"
                      min={1}
                      value={billTotal}
                      onChange={(e) => setBillTotal(Number(e.target.value) || 0)}
                      prefix="₹"
                      className="rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Number of People</label>
                    <Input
                      type="number"
                      min={1}
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value) || 1))}
                      className="rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tip Percentage (%)</label>
                    <Input
                      type="number"
                      min={0}
                      value={tipPercent}
                      onChange={(e) => setTipPercent(Number(e.target.value) || 0)}
                      suffix="%"
                      className="rounded-xl font-semibold"
                    />
                  </div>
                </div>

                {/* Split Result Cards */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-indigo-100">
                    <div className="text-slate-500 text-xs font-medium">Tip Amount</div>
                    <div className="text-lg font-bold text-slate-800 font-mono mt-1">₹ {tipAmount.toFixed(2)}</div>
                  </div>

                  <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-indigo-100">
                    <div className="text-slate-500 text-xs font-medium">Grand Total</div>
                    <div className="text-lg font-bold text-indigo-700 font-mono mt-1">₹ {grandTotalBill.toFixed(2)}</div>
                  </div>

                  <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-sm">
                    <div className="text-indigo-100 text-xs font-medium">Each Person Pays</div>
                    <div className="text-xl font-bold font-mono mt-1">₹ {perPersonAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button icon={<CopyOutlined />} onClick={() => handleCopy(perPersonAmount)}>
                    Copy Share
                  </Button>
                  {onApplyToTransaction && (
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() => handleApply(perPersonAmount)}
                      className="!bg-[#FF735C] !border-none !font-bold"
                    >
                      Use Share in Transaction
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "3",
            label: (
              <span className="flex items-center gap-1.5">
                <PercentageOutlined /> Tax / GST & Discount
              </span>
            ),
            children: (
              <div className="space-y-5 pt-2">
                <div className="flex justify-center gap-2 p-1 bg-slate-100 rounded-xl">
                  {[
                    { key: "addTax", label: "Add Tax / GST (+)" },
                    { key: "removeTax", label: "Remove Tax / GST (-)" },
                    { key: "discount", label: "Discount (% Off)" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setTaxMode(mode.key)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        taxMode === mode.key
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {taxMode === "removeTax" ? "Gross Amount (Includes Tax)" : "Base Amount (₹)"}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
                      prefix="₹"
                      className="rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Rate / Percentage (%)</label>
                    <Input
                      type="number"
                      min={0}
                      value={ratePercent}
                      onChange={(e) => setRatePercent(Number(e.target.value) || 0)}
                      suffix="%"
                      className="rounded-xl font-semibold"
                    />
                  </div>
                </div>

                {/* Tax / Discount Preset Quick Badges */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Presets:</span>
                  {[5, 12, 18, 28].map((pct) => (
                    <Tag
                      key={pct}
                      color="blue"
                      className="cursor-pointer font-bold hover:scale-105 transition-transform"
                      onClick={() => setRatePercent(pct)}
                    >
                      {pct}%
                    </Tag>
                  ))}
                </div>

                {/* Result Cards */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-xs">
                      {taxMode === "discount" ? "Discount Savings" : "Tax / GST Component"}
                    </div>
                    <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
                      ₹ {calculatedValue.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-emerald-700 text-xs font-medium">Final Amount</div>
                    <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">
                      ₹ {finalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button icon={<CopyOutlined />} onClick={() => handleCopy(Math.round(finalPrice * 100) / 100)}>
                    Copy Final Amount
                  </Button>
                  {onApplyToTransaction && (
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() => handleApply(Math.round(finalPrice * 100) / 100)}
                      className="!bg-[#FF735C] !border-none !font-bold"
                    >
                      Use in Transaction
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "4",
            label: (
              <span className="flex items-center gap-1.5">
                <BankOutlined /> Loan EMI
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Loan Amount (₹)</label>
                    <Input
                      type="number"
                      min={1000}
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                      prefix="₹"
                      className="rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Interest Rate (% p.a.)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                      suffix="%"
                      className="rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tenure (Months)</label>
                    <Input
                      type="number"
                      min={1}
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(Number(e.target.value) || 1)}
                      className="rounded-xl font-semibold"
                    />
                  </div>
                </div>

                {/* Result Breakdown */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Monthly Loan EMI</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      ₹ {monthlyEMI.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-400">Total Interest Payable</div>
                      <div className="text-slate-200 font-bold font-mono mt-0.5">
                        ₹ {totalInterest.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Amount Payable</div>
                      <div className="text-slate-200 font-bold font-mono mt-0.5">
                        ₹ {totalPayment.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button icon={<CopyOutlined />} onClick={() => handleCopy(monthlyEMI)}>
                    Copy Monthly EMI
                  </Button>
                  {onApplyToTransaction && (
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() => handleApply(monthlyEMI)}
                      className="!bg-[#FF735C] !border-none !font-bold"
                    >
                      Use EMI in Transaction
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default CalculatorModal;
