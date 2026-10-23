import pptxgen from "pptxgenjs";

// Initialize Presentation
const pres = new pptxgen();

// Set 16:9 Widescreen
pres.layout = "LAYOUT_16x9";
pres.author = "TransportMS Team";
pres.company = "TransportMS ERP Platform";
pres.title = "TransportMS - Complete Platform & Feature Deck";

// Enterprise Color Palette
const COLORS = {
  primary: "1E3A8A",      // Deep Navy Blue
  accent: "2563EB",       // Bright Royal Blue
  lightBlue: "EFF6FF",    // Soft Ice Blue
  darkText: "0F172A",     // Dark Slate
  bodyText: "475569",     // Muted Slate
  cardBg: "FFFFFF",       // Pure White
  cardBorder: "E2E8F0",   // Subtle Gray
  cardBgAlt: "F8FAFC",    // Off-white / light slate
  green: "10B981",        // Emerald Green
  greenBg: "ECFDF5",
  amber: "F59E0B",        // Amber / Orange
  amberBg: "FFFBEB",
  purple: "8B5CF6",       // Violet Purple
  purpleBg: "F5F3FF"
};

// Helper to add clean header
function addHeader(slide, title, category) {
  // Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.5,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: "Arial",
    bold: true,
    color: COLORS.accent,
    charSpacing: 2
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.75,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: "Arial",
    bold: true,
    color: COLORS.darkText
  });

  // Divider Line
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.4,
    w: 11.7,
    h: 0.02,
    fill: { color: COLORS.cardBorder },
    line: { color: COLORS.cardBorder, width: 0 }
  });
}

// Helper to draw modern card
function addCard(slide, { x, y, w, h, title, items, tag, tagColor, borderColor, bgColor }) {
  // Card Container
  slide.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.12,
    fill: { color: bgColor || COLORS.cardBg },
    line: { color: borderColor || COLORS.cardBorder, width: 1.2 }
  });

  let curY = y + 0.25;

  // Optional Badge Tag
  if (tag) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: curY,
      w: 1.6,
      h: 0.28,
      rectRadius: 0.08,
      fill: { color: tagColor ? `${tagColor}22` : COLORS.lightBlue },
      line: { color: tagColor || COLORS.accent, width: 1 }
    });
    slide.addText(tag.toUpperCase(), {
      x: x + 0.3,
      y: curY + 0.02,
      w: 1.6,
      h: 0.24,
      fontSize: 8.5,
      fontFace: "Arial",
      bold: true,
      align: "center",
      color: tagColor || COLORS.accent
    });
    curY += 0.36;
  }

  // Card Title
  slide.addText(title, {
    x: x + 0.3,
    y: curY,
    w: w - 0.6,
    h: 0.35,
    fontSize: 14,
    fontFace: "Arial",
    bold: true,
    color: COLORS.darkText
  });
  curY += 0.42;

  // Card Items (bullet points)
  items.forEach((item) => {
    slide.addText(`•  ${item}`, {
      x: x + 0.3,
      y: curY,
      w: w - 0.6,
      h: 0.38,
      fontSize: 10.5,
      fontFace: "Arial",
      color: COLORS.bodyText,
      lineSpacingMultiple: 1.15
    });
    curY += 0.38;
  });
}

// ==========================================
// SLIDE 1: COVER SLIDE
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.primary };

  // Decorative subtle circle
  slide.addShape(pres.ShapeType.ellipse, {
    x: 9.2,
    y: -1.0,
    w: 5.5,
    h: 5.5,
    fill: { color: "2563EB", transparency: 85 },
    line: { color: "FFFFFF", width: 0 }
  });

  // Badge Tag
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.2,
    y: 1.6,
    w: 3.6,
    h: 0.36,
    rectRadius: 0.1,
    fill: { color: "2563EB", transparency: 40 },
    line: { color: "60A5FA", width: 1 }
  });
  slide.addText("NEXT-GEN FLEET ERP PLATFORM", {
    x: 1.2,
    y: 1.64,
    w: 3.6,
    h: 0.28,
    fontSize: 9.5,
    fontFace: "Arial",
    bold: true,
    align: "center",
    color: "FFFFFF"
  });

  // Title
  slide.addText("TransportMS", {
    x: 1.2,
    y: 2.1,
    w: 10.0,
    h: 1.1,
    fontSize: 48,
    fontFace: "Arial",
    bold: true,
    color: "FFFFFF"
  });

  // Subtitle
  slide.addText("Complete End-to-End Transport & Fleet Management System", {
    x: 1.2,
    y: 3.25,
    w: 11.0,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    color: "93C5FD"
  });

  // Divider
  slide.addShape(pres.ShapeType.rect, {
    x: 1.2,
    y: 3.9,
    w: 2.2,
    h: 0.04,
    fill: { color: "60A5FA" }
  });

  // Description / Highlights
  slide.addText("Operations  •  Fleet & GPS  •  Finance & GST  •  HR & Payroll  •  Driver Mobile App", {
    x: 1.2,
    y: 4.2,
    w: 11.0,
    h: 0.4,
    fontSize: 13,
    fontFace: "Arial",
    color: "E2E8F0"
  });

  // Stat Highlights Container
  const stats = [
    { num: "500+", label: "Vehicles Tracked" },
    { num: "10K+", label: "Trips Dispatched" },
    { num: "99.9%", label: "System Uptime" },
    { num: "100%", label: "GST & Tally Compliant" }
  ];

  stats.forEach((st, i) => {
    const sx = 1.2 + i * 2.8;
    slide.addShape(pres.ShapeType.roundRect, {
      x: sx,
      y: 5.2,
      w: 2.5,
      h: 1.4,
      rectRadius: 0.1,
      fill: { color: "0F172A", transparency: 30 },
      line: { color: "3B82F6", width: 1 }
    });
    slide.addText(st.num, {
      x: sx,
      y: 5.4,
      w: 2.5,
      h: 0.5,
      fontSize: 22,
      fontFace: "Arial",
      bold: true,
      align: "center",
      color: "FFFFFF"
    });
    slide.addText(st.label, {
      x: sx,
      y: 5.95,
      w: 2.5,
      h: 0.4,
      fontSize: 10,
      fontFace: "Arial",
      align: "center",
      color: "94A3B8"
    });
  });
}

// ==========================================
// SLIDE 2: EXECUTIVE SUMMARY & ARCHITECTURE
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "System Architecture & Core Value Proposition", "Overview");

  // Left Big Card: What is TransportMS?
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.7,
    w: 5.6,
    h: 5.1,
    rectRadius: 0.12,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1.2 }
  });

  slide.addText("What is TransportMS?", {
    x: 1.1,
    y: 1.95,
    w: 5.0,
    h: 0.35,
    fontSize: 16,
    fontFace: "Arial",
    bold: true,
    color: COLORS.primary
  });

  slide.addText(
    "TransportMS is an enterprise-grade Transport Management System designed for fleet owners, logistics operators, freight forwarders, and 3PL companies.\n\n" +
    "It solves real-world logistics challenges: dispatch bottlenecks, fuel thefts, document penalties, uncollected freight, and driver salary disputes through single-window unified automation.",
    {
      x: 1.1,
      y: 2.45,
      w: 5.0,
      h: 1.6,
      fontSize: 11,
      fontFace: "Arial",
      color: COLORS.bodyText,
      lineSpacingMultiple: 1.2
    }
  );

  const pillars = [
    "⚡ Real-Time Operational Automation: From order booking to live trip closure",
    "🛡️ 100% Compliance Guard: Zero challans via auto-document expiry alerts",
    "📈 Profit Visibility: Per-trip gross & net profit calculation with fuel/toll data",
    "📱 Driver Mobility: Dedicated lightweight portal for POD uploads & route status"
  ];

  let py = 4.2;
  pillars.forEach(p => {
    slide.addText(p, {
      x: 1.1,
      y: py,
      w: 5.0,
      h: 0.55,
      fontSize: 10.5,
      fontFace: "Arial",
      color: COLORS.darkText
    });
    py += 0.6;
  });

  // Right Side: 3 Stacked Cards (Architecture)
  addCard(slide, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 1.55,
    tag: "FRONTEND",
    tagColor: COLORS.accent,
    title: "Vite + React Modern Web Client",
    items: [
      "Lightweight, lightning-fast rendering with sub-second page transitions",
      "Enterprise Light Theme UI built for Indian road logistics workflow"
    ]
  });

  addCard(slide, {
    x: 6.8,
    y: 3.45,
    w: 5.7,
    h: 1.55,
    tag: "BACKEND",
    tagColor: COLORS.green,
    title: "Spring Boot 3 + Java Enterprise Core",
    items: [
      "Robust RESTful architecture, multitenancy & JWT / API Key security",
      "High-throughput concurrency handling fleet transactions smoothly"
    ]
  });

  addCard(slide, {
    x: 6.8,
    y: 5.2,
    w: 5.7,
    h: 1.55,
    tag: "DATABASE & INT.",
    tagColor: COLORS.purple,
    title: "MySQL 8 + WhatsApp & SMS APIs",
    items: [
      "Relational schema for orders, vehicles, LR/bilty, expenses & payroll",
      "Twilio / WhatsApp webhooks for automated customer & driver dispatches"
    ]
  });
}

// ==========================================
// SLIDE 3: TRIP DISPATCH & FLEET OPERATIONS
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Trip Planning, Dispatch & Smart Recommendation", "Fleet Operations");

  addCard(slide, {
    x: 0.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "DISPATCH ENGINE",
    tagColor: COLORS.accent,
    title: "Intelligent Trip Dispatch",
    items: [
      "Interactive New Trip Wizard (Pick origin, destination & consignee)",
      "Automated Distance & Toll Estimation between 100+ Indian hubs",
      "Smart Recommendation Engine ranks available trucks by capacity, location & gross profit",
      "Multi-driver assignment with license validity check before dispatch",
      "Automated trip sheet generation & instant WhatsApp alerts"
    ]
  });

  addCard(slide, {
    x: 4.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "LEGAL & LOGISTICS",
    tagColor: COLORS.green,
    title: "LR / Bilty & e-Way Bill",
    items: [
      "Instant Lorry Receipt (LR / Bilty) generator with GST breakdown",
      "Consignor & Consignee details with GSTIN validation",
      "PDF Download & Print with company branding and terms",
      "Digital Proof of Delivery (POD) image upload & archive",
      "e-Way bill number tagging & automated expiry monitoring"
    ]
  });

  addCard(slide, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "GPS TELEMATICS",
    tagColor: COLORS.purple,
    title: "Live Tracking & Tolls",
    items: [
      "Real-time GPS Tracking on interactive OpenStreetMap map",
      "Speed monitoring, stoppage detection & route deviation alerts",
      "Public tracking URL sharing for clients & consignees",
      "FASTag Toll Integration with vehicle-wise debit records",
      "Toll vs Freight cost ratio analyzer to detect non-optimal routes"
    ]
  });
}

// ==========================================
// SLIDE 4: VEHICLE & DRIVER MANAGEMENT
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Vehicle Master, Driver Portal & Document Vault", "Resource Management");

  addCard(slide, {
    x: 0.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "FLEET REPOSITORY",
    tagColor: COLORS.accent,
    title: "Vehicle Master 360°",
    items: [
      "Comprehensive registry (Type, Model, Axle count, Gross Weight)",
      "Status tracking: Available, On-Trip, Under Maintenance, Inactive",
      "Tyre health & replacement odometer tracking",
      "Scheduled maintenance, service records & garage workshop bills",
      "Vehicle Profitability: Revenue earned vs Maintenance & Fuel burned"
    ]
  });

  addCard(slide, {
    x: 4.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "HUMAN RESOURCES",
    tagColor: COLORS.green,
    title: "Driver Management",
    items: [
      "Driver KYC: Aadhaar, PAN, Driving License, Blood Group & Address",
      "Salary structures: Fixed Monthly vs Per-Trip / Per-KM models",
      "Trip history, active trip status, advance cash ledger",
      "Driver Rating & Performance Scorecard based on on-time delivery",
      "Emergency SOS contacts & medical insurance logs"
    ]
  });

  addCard(slide, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "ZERO PENALTY",
    tagColor: COLORS.amber,
    title: "Document Expiry Vault",
    items: [
      "Automated tracking for 6+ documents: Fitness, Insurance, Pollution, National Permit, Road Tax, DL",
      "Color-coded status alerts (Green = Active, Orange = Expiring in 15 Days, Red = Expired)",
      "Automated blocking: System prevents dispatching vehicles with expired permits",
      "Document file upload & secure cloud PDF/image storage"
    ]
  });
}

// ==========================================
// SLIDE 5: FINANCE, GST & CASH/BANK
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Invoicing, Expense Auditing, GST & Profit / Loss", "Financial Control");

  addCard(slide, {
    x: 0.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "INVOICING",
    tagColor: COLORS.accent,
    title: "Billing & Invoicing",
    items: [
      "Single-click Freight Invoice creation from completed trips",
      "Automatic detention, loading/unloading & bilty charges",
      "Payment Tracking: Paid, Partially Paid, Overdue with age analysis",
      "Professional PDF generation with QR codes & bank details",
      "Direct email & WhatsApp dispatch to corporate clients"
    ]
  });

  addCard(slide, {
    x: 4.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "CASH FLOW",
    tagColor: COLORS.purple,
    title: "Expenses & Bank",
    items: [
      "Trip expense log: Fuel receipts, Toll slips, RTO/Police, En-route repairs",
      "Cash & Bank Book ledger with real-time balance tracking",
      "Vehicle Loan & EMI tracker with interest & principal amortization",
      "Petty cash reconciliation for branch offices & loading yards",
      "Vendor bill settlements for spare parts, tyres and lube oil"
    ]
  });

  addCard(slide, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "P&L & TAXATION",
    tagColor: COLORS.green,
    title: "Profit / Loss & GST",
    items: [
      "Real-time Trip-by-Trip P&L: (Freight) minus (Fuel + Toll + Driver + Maintenance)",
      "Route Profitability Heatmap: Identifies loss-making corridors",
      "GST Return preparation: Output GST, RCM (Reverse Charge Mechanism)",
      "Tally ERP sync JSON exporter for chartered accountants",
      "Monthly & annual revenue graphs with YoY margin comparison"
    ]
  });
}

// ==========================================
// SLIDE 6: FUEL, INVENTORY & VENDORS
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Fuel Theft Prevention, Inventory & Spare Parts", "Resources & Yard");

  addCard(slide, {
    x: 0.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "THEFT CONTROL",
    tagColor: COLORS.amber,
    title: "Fuel Management",
    items: [
      "Petrol pump fuel slip logging (Liters, Price/L, Odometer, Pump name)",
      "Automated Mileage (KM/L) calculation on every refill",
      "Fuel Anomaly Detector: Flags mileage drops below truck baseline",
      "Credit fuel card reconciliation & monthly diesel consumption reports",
      "Slip image OCR scanner for zero manual data entry errors"
    ]
  });

  addCard(slide, {
    x: 4.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "WAREHOUSE",
    tagColor: COLORS.accent,
    title: "Spare Parts Inventory",
    items: [
      "Workshop inventory tracking (Tyres, Engine Oil, Filters, Brake Pads, DEF)",
      "Min-Stock threshold alerts to prevent workshop downtime",
      "Part Issue logs linked to specific vehicle registration numbers",
      "Scrap & retreading cycle management for commercial tyres",
      "Valuation of existing yard inventory on FIFO basis"
    ]
  });

  addCard(slide, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "SUPPLY CHAIN",
    tagColor: COLORS.purple,
    title: "Vendor Ecosystem",
    items: [
      "Vendor database: Garages, Tyre dealers, Fuel pumps & Insurance brokers",
      "Vendor ledger tracking outstanding payables and payment history",
      "Rate contract benchmarking to negotiate volume discounts",
      "Direct bank transfer payment voucher recording",
      "Vendor performance scoring based on repair speed & warranty claims"
    ]
  });
}

// ==========================================
// SLIDE 7: HR, ATTENDANCE & PAYROLL
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Attendance, Staff Labor & Salary Processing", "HR & Workforce");

  addCard(slide, {
    x: 0.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "DAILY LOG",
    tagColor: COLORS.accent,
    title: "Daily Attendance Tracker",
    items: [
      "Three distinct worker tiers: Drivers, Managers & Yard Staff",
      "One-click Present (P), Absent (A), Leave (L) daily marking",
      "Integrated date picker for retroactive log verification",
      "Driver self-attendance submission via Driver Mobile Portal",
      "Color-coded visual badges for Super Admin, Manager, Accountant, Dispatcher & HR"
    ]
  });

  addCard(slide, {
    x: 4.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "PAYROLL ENGINE",
    tagColor: COLORS.green,
    title: "Salary & Deductions",
    items: [
      "Monthly aggregated calculation: Base salary minus absent day salary cuts",
      "Trip allowance, overtime, Bhatta & performance bonus additions",
      "Advance salary deduction handling with auto-balance adjustment",
      "Automated Payslip generation with printable PDF voucher",
      "Bank NEFT/RTGS batch transfer sheet export"
    ]
  });

  addCard(slide, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "LABOR MGT",
    tagColor: COLORS.purple,
    title: "Staff & Yard Labor",
    items: [
      "Loading/unloading labor gang ledger & piece-rate wage calculation",
      "Branch operations team directory with mobile contacts",
      "Emergency leave requests & shift scheduling",
      "Role-based performance incentives for dispatch managers",
      "Strict data isolation between staff salary and driver payouts"
    ]
  });
}

// ==========================================
// SLIDE 8: SYSTEM SECURITY, RBAC & AUDIT
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Role-Based Access Control, API Docs & Audit Logs", "System & Security");

  addCard(slide, {
    x: 0.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "ACCESS CONTROL",
    tagColor: COLORS.accent,
    title: "Granular RBAC",
    items: [
      "6 Pre-configured roles: Super Admin, Manager, Accountant, Dispatcher, HR & Driver",
      "Route-level permission gatekeeper: Block access to unauthorized finance or HR tabs",
      "Multi-tenant isolation: Complete data privacy per transport company",
      "2FA (Two-Factor Authentication) with OTP verification on login",
      "Custom role builder for regional branch office managers"
    ]
  });

  addCard(slide, {
    x: 4.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "TRANSPARENCY",
    tagColor: COLORS.amber,
    title: "Audit Trail & Logs",
    items: [
      "Immutable log of every user action: Trip created, Expense approved, Bill edited",
      "IP Address, timestamp & previous vs modified values recording",
      "Fraud detection: Flags suspicious backdated freight changes or expense deletions",
      "System health watchdog & background server ping monitor",
      "Exportable CSV logs for statutory compliance audits"
    ]
  });

  addCard(slide, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 5.1,
    tag: "DEVELOPER API",
    tagColor: COLORS.purple,
    title: "Open API & Sandbox",
    items: [
      "Full REST API suite for ERP / SAP / Tally third-party integrations",
      "Interactive Sandbox API documentation (live test endpoints directly in browser)",
      "Secured API Keys with rate-limiting & customizable scope policies",
      "Incoming webhooks for GPS hardware telematics (Teltonika, Concox, etc.)",
      "Fastag & e-Invoicing webhook endpoints"
    ]
  });
}

// ==========================================
// SLIDE 9: BUSINESS IMPACT & ROI
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.cardBgAlt };
  addHeader(slide, "Business ROI & Competitive Advantage", "Why TransportMS?");

  const impacts = [
    {
      num: "35%+",
      title: "Fuel & Toll Cost Savings",
      desc: "By detecting abnormal mileage dips, identifying non-optimal toll routes, and preventing diesel thefts."
    },
    {
      num: "Zero",
      title: "Document Expiry Fines",
      desc: "Proactive automated notifications prevent vehicles from getting impounded by RTO or police at state borders."
    },
    {
      num: "4x Faster",
      title: "Trip Dispatch & Billing",
      desc: "One-click automated recommendation engine, instant digital bilty generation, and automated invoice dispatch."
    },
    {
      num: "100%",
      title: "Cash Flow Transparency",
      desc: "Per-trip P&L visibility ensures owners know exactly which routes and clients make money and which lose money."
    }
  ];

  impacts.forEach((imp, i) => {
    const ix = 0.8 + i * 2.95;
    slide.addShape(pres.ShapeType.roundRect, {
      x: ix,
      y: 1.8,
      w: 2.8,
      h: 3.3,
      rectRadius: 0.12,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1.2 }
    });

    slide.addText(imp.num, {
      x: ix,
      y: 2.1,
      w: 2.8,
      h: 0.6,
      fontSize: 28,
      fontFace: "Arial",
      bold: true,
      align: "center",
      color: COLORS.accent
    });

    slide.addText(imp.title, {
      x: ix + 0.2,
      y: 2.8,
      w: 2.4,
      h: 0.5,
      fontSize: 13,
      fontFace: "Arial",
      bold: true,
      align: "center",
      color: COLORS.darkText
    });

    slide.addText(imp.desc, {
      x: ix + 0.2,
      y: 3.4,
      w: 2.4,
      h: 1.5,
      fontSize: 10,
      fontFace: "Arial",
      align: "center",
      color: COLORS.bodyText,
      lineSpacingMultiple: 1.2
    });
  });

  // Bottom Banner
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 5.4,
    w: 11.7,
    h: 1.4,
    rectRadius: 0.12,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary, width: 0 }
  });

  slide.addText("READY TO MODERNIZE YOUR FLEET OPERATIONS?", {
    x: 1.2,
    y: 5.65,
    w: 11.0,
    h: 0.35,
    fontSize: 16,
    fontFace: "Arial",
    bold: true,
    color: "FFFFFF"
  });

  slide.addText("TransportMS delivers enterprise-level logistics automation with an intuitive, clean interface tailored for Indian transport logistics.", {
    x: 1.2,
    y: 6.05,
    w: 11.0,
    h: 0.45,
    fontSize: 11,
    fontFace: "Arial",
    color: "93C5FD"
  });
}

// Generate Presentation to disk
const outputPath = "TransportMS_Feature_Deck.pptx";
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`Presentation generated successfully: ${outputPath}`);
  })
  .catch((err) => {
    console.error("Error generating presentation:", err);
  });
