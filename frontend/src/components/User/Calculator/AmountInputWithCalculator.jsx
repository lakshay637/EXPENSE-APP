import React, { useState } from "react";
import { Input, Tag, Tooltip } from "antd";
import { CalculatorOutlined } from "@ant-design/icons";

// Safe Math Evaluator for inline expressions
const evaluateInlineMath = (expr) => {
  if (expr === null || expr === undefined) return null;
  const str = String(expr).trim();
  if (!str) return null;

  // If already a plain clean number, return it
  if (!isNaN(Number(str))) return Number(str);

  try {
    const sanitized = str.replace(/[^0-9+\-*/%.() ]/g, "");
    if (!sanitized.trim()) return null;

    const formatted = sanitized.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

    // eslint-disable-next-line no-new-func
    const res = new Function(`"use strict"; return (${formatted})`)();
    if (typeof res === "number" && !isNaN(res) && isFinite(res) && res >= 0) {
      return Math.round(res * 100) / 100;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const AmountInputWithCalculator = ({ value, onChange, placeholder = "0.00", onOpenCalculator }) => {
  const [inputText, setInputText] = useState(value !== undefined && value !== null ? String(value) : "");
  const [focused, setFocused] = useState(false);

  // Sync internal state if external value changes (and field is not currently focused by user typing)
  React.useEffect(() => {
    if (!focused) {
      setInputText(value !== undefined && value !== null ? String(value) : "");
    }
  }, [value, focused]);

  const liveEvaluated = evaluateInlineMath(inputText);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    // If it's a valid plain number, propagate immediately
    const parsedNumber = Number(val);
    if (!isNaN(parsedNumber) && val.trim() !== "") {
      onChange?.(parsedNumber);
    } else {
      const evalVal = evaluateInlineMath(val);
      if (evalVal !== null) {
        onChange?.(evalVal);
      }
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const evalVal = evaluateInlineMath(inputText);
    if (evalVal !== null) {
      setInputText(String(evalVal));
      onChange?.(evalVal);
    } else if (!inputText.trim()) {
      onChange?.(undefined);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const evalVal = evaluateInlineMath(inputText);
      if (evalVal !== null) {
        setInputText(String(evalVal));
        onChange?.(evalVal);
      }
    }
  };

  return (
    <div className="relative">
      <Input
        value={inputText}
        onChange={handleTextChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        prefix={<span className="text-slate-400 font-bold">₹</span>}
        suffix={
          <div className="flex items-center gap-1.5">
            {liveEvaluated !== null && String(liveEvaluated) !== inputText && (
              <Tag color="green" className="font-mono text-xs font-bold !mr-0 animate-fade-in">
                = ₹{liveEvaluated}
              </Tag>
            )}

            {onOpenCalculator && (
              <Tooltip title="Open Inbuilt Calculator">
                <button
                  type="button"
                  onClick={onOpenCalculator}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <CalculatorOutlined className="text-base" />
                </button>
              </Tooltip>
            )}
          </div>
        }
        className="rounded-xl font-mono text-base font-semibold"
      />
      {liveEvaluated !== null && String(liveEvaluated) !== inputText && (
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between px-1">
          <span>Press Enter/Tab to evaluate math expression</span>
        </div>
      )}
    </div>
  );
};

export default AmountInputWithCalculator;
