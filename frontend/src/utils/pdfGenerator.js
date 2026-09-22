import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

/**
 * Generate and download an executive-grade, professional PDF transaction report
 * @param {Array} transactions List of transaction objects
 * @param {Object} options Metadata options like userName, reportTitle, summaryStats
 */
export const downloadTransactionsPDF = (transactions = [], options = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const {
    userName = "Valued User",
    reportTitle = "Financial Statement of Accounts",
    summaryStats = null,
  } = options;

  // Colors
  const headerBgColor = [15, 23, 42]; // Slate 900 (Dark Executive Navy)
  const accentColor = [16, 185, 129]; // Emerald Green Accent
  const darkTextColor = [30, 41, 59]; // Slate 800
  const lightBgColor = [248, 250, 252]; // Slate 50
  const borderColor = [226, 232, 240]; // Slate 200

  // 1. Executive Top Header Banner
  doc.setFillColor(...headerBgColor);
  doc.rect(0, 0, 210, 32, "F");

  // Accent line below banner
  doc.setFillColor(...accentColor);
  doc.rect(0, 32, 210, 1.5, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EXPENSE TRACKER", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text("STATEMENT OF ACCOUNTS & FINANCIAL TRANSACTIONS", 14, 22);

  // Top Right Info in Header
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`DATE: ${dayjs().format("DD MMM YYYY, HH:mm")}`, 196, 15, { align: "right" });
  doc.text(`REF ID: EXP-${dayjs().format("YYYYMMDD")}-${Math.floor(1000 + Math.random() * 9000)}`, 196, 21, { align: "right" });

  let startY = 40;

  // 2. User & Statement Details Box
  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, startY, 182, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  doc.text("ACCOUNT HOLDER:", 18, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(userName.toUpperCase(), 52, startY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("REPORT TYPE:", 18, startY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(reportTitle, 52, startY + 14);

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL RECORDS:", 135, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(`${transactions.length} Transactions`, 166, startY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("STATUS:", 135, startY + 14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(16, 185, 129);
  doc.text("VERIFIED STATEMENT", 166, startY + 14);

  startY += 26;

  // 3. Executive KPI Summary Cards (If stats provided or calculated from transactions)
  let calcIncome = 0;
  let calcExpense = 0;

  transactions.forEach((item) => {
    const amt = Number(item.amount) || 0;
    if ((item.type || "").toLowerCase() === "income") {
      calcIncome += amt;
    } else {
      calcExpense += amt;
    }
  });

  const displayIncome = summaryStats?.totalIncome ?? calcIncome;
  const displayExpense = summaryStats?.totalExpense ?? calcExpense;
  const displayNet = summaryStats?.netBalance ?? (displayIncome - displayExpense);

  const cardWidth = 58;
  const cardHeight = 18;

  // Total Income Card
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(14, startY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text("TOTAL INCOME", 18, startY + 6);
  doc.setFontSize(11);
  doc.text(`+ Rs. ${displayIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 18, startY + 13);

  // Total Expense Card
  doc.setFillColor(254, 242, 242); // Rose 50
  doc.setDrawColor(254, 202, 202); // Rose 200
  doc.roundedRect(76, startY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(190, 18, 60); // Rose 700
  doc.text("TOTAL EXPENSES", 80, startY + 6);
  doc.setFontSize(11);
  doc.text(`- Rs. ${displayExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 80, startY + 13);

  // Net Balance Card
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.roundedRect(138, startY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(67, 56, 202); // Indigo 700
  doc.text("NET CASH FLOW", 142, startY + 6);
  doc.setFontSize(11);
  doc.text(`Rs. ${displayNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 142, startY + 13);

  startY += 24;

  // 4. Financial Transactions Table
  const tableHeaders = [["#", "Date", "Title & Notes", "Type", "Category", "Payment Method", "Amount (Rs.)"]];

  const tableRows = transactions.map((item, index) => {
    const formattedDate = dayjs(item.date).format("YYYY-MM-DD");
    const typeLabel = (item.type || "expense").toUpperCase();
    const notesStr = item.notes ? `\nNote: ${item.notes}` : "";
    const titleAndNotes = `${item.title || "Untitled"}${notesStr}`;
    const amountVal = Number(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const amountStr = typeLabel === "INCOME" ? `+ Rs. ${amountVal}` : `- Rs. ${amountVal}`;

    return [
      index + 1,
      formattedDate,
      titleAndNotes,
      typeLabel,
      item.category || "General",
      item.paymentMethod || "Cash",
      amountStr,
    ];
  });

  autoTable(doc, {
    startY: startY,
    margin: { left: 14, right: 14 },
    head: tableHeaders,
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "left",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkTextColor,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightBgColor,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 24 },
      2: { cellWidth: 50 },
      3: { cellWidth: 18, fontStyle: "bold" },
      4: { cellWidth: 26 },
      5: { cellWidth: 24 },
      6: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        // Color code Type column
        if (data.column.index === 3) {
          if (data.cell.text[0] === "INCOME") {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [225, 29, 72];
          }
        }
        // Color code Amount column
        if (data.column.index === 6) {
          const cellText = data.cell.text[0] || "";
          if (cellText.startsWith("+")) {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald
          } else {
            data.cell.styles.textColor = [225, 29, 72]; // Rose
          }
        }
      }
    },
    didDrawPage: (data) => {
      const totalPages = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;

      // Bottom footer line
      doc.setDrawColor(...borderColor);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Official Computer-Generated Financial Statement | Expense Tracker App",
        14,
        pageHeight - 9
      );

      doc.text(
        `Page ${data.pageNumber} of ${totalPages}`,
        pageWidth - 14,
        pageHeight - 9,
        { align: "right" }
      );
    },
  });

  // Save the PDF file
  const fileName = `Financial_Statement_${userName.replace(/\s+/g, "_")}_${dayjs().format("YYYY-MM-DD")}.pdf`;
  doc.save(fileName);
};
