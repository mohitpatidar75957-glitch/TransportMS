# TMS Logistics Platform — Product Overview

**Document Type:** Product Requirements Document (PRD)  
**Section:** 01 — Product Overview  
**Product:** Modern Transport Management System (TMS)  
**Product Direction:** New product designed for 2026

---

## 1. Product Definition

A **role-based Transport Management System (TMS)** that manages the complete transportation lifecycle in one connected platform.

It connects:

**Business → Operations → Fleet → Drivers/Vendors → Trips → Documents → Tracking → Delivery → Billing → Settlement → Analytics**

The product is designed to replace disconnected manual processes with a single operational system.

---

## 2. Product Vision

> **Give transport businesses one system to plan, execute, monitor, and financially close every transportation operation.**

The platform should help users understand:

- What is happening now?
- What needs attention?
- What is delayed or at risk?
- What action should be taken?
- What is the financial result?

---

## 3. Core Product Objective

The TMS should connect the complete trip lifecycle:

```text
LOAD / TRANSPORT REQUEST
          ↓
TRIP CREATION
          ↓
PLANNING & PRICING
          ↓
VEHICLE + DRIVER / VENDOR
          ↓
DOCUMENT PREPARATION
          ↓
DISPATCH
          ↓
LIVE JOURNEY
          ↓
EXCEPTIONS / UPDATES
          ↓
DELIVERY
          ↓
POD / DOCUMENT COLLECTION
          ↓
TRIP CLOSURE
          ↓
BILLING
          ↓
EXPENSES & SETTLEMENT
          ↓
PROFITABILITY
          ↓
REPORTING
```

**Design principle:** A trip should remain connected to its vehicle, driver/vendor, documents, expenses, tracking, delivery, billing, and settlement throughout its lifecycle.

---

## 4. Core Product Areas

| Area | Purpose |
|---|---|
| Platform Administration | Manage businesses, users, permissions, configuration and system controls |
| Fleet Management | Manage vehicles, availability, documents, maintenance and utilization |
| Driver Management | Manage drivers, assignments, attendance, earnings and settlements |
| Trip Management | Create, plan, assign, dispatch, monitor and close trips |
| Live Tracking | Monitor active vehicles, routes, ETA and exceptions |
| Vendor Management | Manage transport partners, loads, commissions and settlements |
| Fuel Management | Record, monitor and analyze vehicle/trip fuel usage |
| Documents | Manage LR/Bilty, POD, compliance and operational documents |
| Finance & Accounting | Manage billing, expenses, receivables, payables, payroll and cash |
| HR & Payroll | Manage attendance, staff, salary and payroll processes |
| Inventory | Manage tyres, spares, lubricants and other transport resources |
| Reports & Analytics | Convert operational and financial data into business insights |

---

## 5. Primary User Roles

The platform has six primary roles:

```text
                    TMS PLATFORM
                         │
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
 SUPER ADMIN       BUSINESS OWNER       MANAGER
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
        ACCOUNTANT     DRIVER      VENDOR
```

Each role uses the same underlying business data but receives a different dashboard, navigation structure, permissions, actions and workflow.

Detailed role definitions will be covered in **Section 02 — Users, Roles & Responsibilities**.

---

## 6. Product Operating Model

### One Record → Multiple Workflows

Information should be entered once and reused across the system.

Example:

```text
TRIP CREATED
     │
     ├── Vehicle assigned
     ├── Driver/vendor assigned
     ├── Documents linked
     ├── Tracking activated
     ├── Trip visible to Manager
     ├── Trip visible to Driver/Vendor
     ├── Expenses linked
     ├── Delivery/POD recorded
     ├── Invoice generated
     ├── Settlement calculated
     └── Reports updated
```

This reduces duplicate entry, inconsistency and manual coordination.

---

## 7. 2026 Product Principles

### 7.1 Action-Oriented

Dashboards should not only show information.

They should surface the next action.

**Example:**

`12 documents expiring → Review Documents`

---

### 7.2 Exception-First

The system should highlight situations that require attention:

- Delayed trip
- Route deviation
- Vehicle unavailable
- Driver unavailable
- Missing document
- Expired document
- Missing POD
- Unexpected fuel usage
- Maintenance due
- Payment overdue

---

### 7.3 Role-Specific

The same data should be presented according to the user's responsibility.

```text
DRIVER
"What do I need to do?"

MANAGER
"What needs operational attention?"

ACCOUNTANT
"What needs to be billed, paid or reconciled?"

BUSINESS OWNER
"How is the business performing?"

VENDOR
"What loads and payments are associated with me?"

SUPER ADMIN
"Is the platform and account ecosystem healthy?"
```

---

### 7.4 Connected

Modules should behave as one system rather than isolated applications.

**Trip ↔ Vehicle ↔ Driver/Vendor ↔ Documents ↔ Tracking ↔ Expenses ↔ Billing ↔ Settlement**

---

### 7.5 Proactive

The product should help users identify problems before they become larger operational issues through alerts, reminders, exceptions and relevant recommendations.

---

## 8. High-Level Product Architecture

```text
                    TMS PLATFORM
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   MANAGEMENT        OPERATIONS        EXECUTION
        │                │                │
  Owner / Finance    Trips / Fleet    Driver / Vendor
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                  SHARED DATA LAYER
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   DOCUMENTS         FINANCE          ANALYTICS
   LR / POD          Billing          Reports
   Compliance        Expenses         KPIs
   Verification      Payroll          Insights
```

---

## 9. Product Design Direction

This product should **not** be designed as a simple collection of tables and forms.

The UX should be:

- Workflow-first
- Role-specific
- Action-oriented
- Exception-aware
- Real-time where required
- Mobile-friendly for field users
- Scalable for growing operations
- Automation-ready
- Insight-driven

The reference dashboards are **visual and structural references only**. Their navigation, features and workflows should not be copied blindly.

The final product structure must be based on the **complete transportation lifecycle and 2026 product expectations**.

---

## 10. Success Definition

The TMS succeeds when:

```text
MANUAL WORK
     ↓
CONNECTED WORKFLOW
     ↓
VISIBLE OPERATIONS
     ↓
PROACTIVE EXCEPTIONS
     ↓
AUTOMATED PROCESSES
     ↓
BETTER DECISIONS
```

A user should be able to enter the system and quickly understand:

**What is happening → What is wrong → What needs action → What is the business impact.**

---

## 11. One-Line Product Definition

> **A modern, role-based TMS that connects transportation planning, fleet, drivers, vendors, trips, documents, tracking, delivery, finance and analytics into one operational system.**

---

## Next PRD Section

**02 — Users, Roles & Responsibilities**

This section will define the six roles, their goals, responsibilities, access boundaries, daily tasks, key actions and role-specific product needs.
