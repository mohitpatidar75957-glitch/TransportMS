# TMS Logistics Platform — Users, Roles & Responsibilities

**Document Type:** Product Requirements Document (PRD)  
**Section:** 02 — Users, Roles & Responsibilities  
**Product Direction:** Modern TMS designed for 2026

---

## 1. Purpose

The TMS supports six primary roles. Each role receives a different workspace, navigation, permissions, information priority and set of actions while using the same connected business data.

### Core Principle

> **One platform → six role-specific experiences → one connected data system.**

---

## 2. Role Structure

```text
                         TMS PLATFORM
                              │
                    ┌─────────┴─────────┐
                    │                   │
              PLATFORM LEVEL       BUSINESS LEVEL
                    │                   │
              SUPER ADMIN         BUSINESS OWNER
                                        │
                         ┌──────────────┼──────────────┐
                         ↓              ↓              ↓
                      MANAGER       ACCOUNTANT      OPERATIONS
                         │                             │
                    ┌────┴────┐                   ┌────┴────┐
                    ↓         ↓                   ↓         ↓
                 DRIVER     VENDOR              FLEET     TRIPS
```

---

## 3. Role Summary

| Role | Primary Focus | Main Question |
|---|---|---|
| **Super Admin** | Platform | Is the platform and account ecosystem healthy? |
| **Business Owner** | Business | How is my business performing? |
| **Manager** | Operations | What needs operational attention? |
| **Accountant** | Finance | What needs to be billed, paid or reconciled? |
| **Driver** | Trip Execution | What do I need to do now? |
| **Vendor** | Partner Operations | What loads and payments do I have? |

---

# 4. Super Admin / Platform Owner

## Purpose

Controls the overall TMS platform and platform-level configuration. Does not primarily run individual transportation operations.

## Responsibilities

- Manage business accounts
- Manage platform users
- Manage roles and permissions
- Configure global settings
- Monitor platform activity
- Review audit logs
- Monitor system health
- Manage platform-level notifications
- Activate/suspend business accounts

## Main Areas

```text
Super Admin
│
├── Dashboard
├── Business / Account Management
├── User Management
├── Roles & Permissions
├── System Configuration
├── Audit Logs
├── System Health
├── Notifications
└── Platform Reports
```

## Should Not Primarily Handle

Daily trip dispatch, driver attendance, routine fuel entries, routine invoices or vehicle assignments.

---

# 5. Business Owner

## Purpose

Controls and monitors the transportation business from a business and management perspective.

## Responsibilities

- Monitor business performance
- Monitor fleet and active trips
- Review revenue, expenses and profitability
- Review receivables and major payments
- Monitor operational risks
- Manage business users
- Review reports
- Approve important business decisions
- Review vendors and business relationships

## Main Areas

```text
Business Owner
│
├── Dashboard
├── Fleet & Vehicles
├── Drivers
├── Trips
├── Live Tracking
├── Finance
├── Fuel
├── Vendors
├── Inventory
├── HR / Payroll
├── Documents
└── Reports
```

## Dashboard Priority

```text
BUSINESS PERFORMANCE
        ↓
OPERATIONAL PERFORMANCE
        ↓
FINANCIAL HEALTH
        ↓
EXCEPTIONS / RISKS
        ↓
REQUIRED ACTIONS
```

The owner experience should prioritize decision-making over routine data entry.

---

# 6. Manager

## Purpose

Runs the day-to-day transportation operation and acts as the primary operational control point.

## Responsibilities

- Create and manage trips
- Plan loads
- Assign vehicles
- Assign drivers
- Coordinate vendors
- Dispatch trips
- Monitor active trips
- Handle operational exceptions
- Monitor vehicle availability
- Review trip documents
- Coordinate delivery and POD
- Monitor fleet utilization

## Main Areas

```text
Manager
│
├── Dashboard
├── Vehicles
├── Drivers
├── Trips
├── LR / Bilty
├── Live Tracking
├── Fuel Management
├── Vendors
├── Inventory
├── Documents
└── Reports
```

## Core Workflow

```text
PLAN
 ↓
ASSIGN
 ↓
DISPATCH
 ↓
MONITOR
 ↓
HANDLE EXCEPTION
 ↓
DELIVER
 ↓
CLOSE TRIP
```

The Manager experience should be operations-first.

---

# 7. Accountant

## Purpose

Controls the financial lifecycle connected to transportation operations.

## Responsibilities

- Create/manage invoices
- Track receivables
- Record expenses
- Process payments
- Manage vendor settlements
- Manage driver settlements
- Process payroll
- Manage cash and bank records
- Track loans/EMIs
- Review profit and loss
- Manage financial documents
- Support GST-related workflows
- Reconcile transactions

## Main Areas

```text
Accountant
│
├── Dashboard
├── Billing / Invoices
├── Expenses
├── Receivables / Payables
├── Profit & Loss
├── Loans / EMI
├── Cash / Bank
├── Salary / Payroll
├── Vendor Settlements
├── Driver Settlements
├── Documents
└── Reports
```

## Core Workflow

```text
TRIP COMPLETED
      ↓
BILLING ELIGIBILITY
      ↓
INVOICE
      ↓
RECEIVABLE
      ↓
PAYMENT
      ↓
RECONCILIATION
      ↓
FINANCIAL REPORTING
```

The Accountant experience should focus on financially relevant records and actions.

---

# 8. Driver

## Purpose

Executes assigned trips and provides operational updates from the field.

The Driver should have the simplest and most action-focused experience.

## Responsibilities

- View assigned trips
- Acknowledge assignments
- View route and destination
- Start trip
- Share location
- Update trip status
- Record fuel
- Upload required documents
- Capture POD
- Report incidents
- View attendance
- View earnings/settlements
- View salary information

## Main Areas

```text
Driver
│
├── Home
├── My Trips
├── My Attendance
├── Fuel Entry
├── My Salary / Earnings
├── My Profile
└── Location / Tracking
```

## Trip Workflow

```text
ASSIGNMENT
    ↓
ACKNOWLEDGE
    ↓
PRE-TRIP CHECK
    ↓
START TRIP
    ↓
TRAVEL
    ↓
STATUS / LOCATION UPDATES
    ↓
DELIVERY
    ↓
POD
    ↓
TRIP COMPLETE
```

### UX Principle

Prioritize:

**Next Action → Route → Trip Status → Documents → Updates → Completion**

Avoid exposing complex business screens to drivers unless required.

---

# 9. Vendor

## Purpose

Allows external transport partners to manage assigned loads, transportation execution, earnings and payments.

## Responsibilities

- View assigned loads
- Accept assignments
- Submit transportation details
- Track assigned trips
- Upload required documents
- Monitor trip status
- View freight/commission
- View pending settlements
- View payment history
- Maintain vendor profile

## Main Areas

```text
Vendor
│
├── Dashboard
├── Assigned Trips / Loads
├── My Profile
├── Documents
├── Earnings / Commission
└── Payments
```

## Core Workflow

```text
LOAD ASSIGNED
      ↓
LOAD ACCEPTED
      ↓
TRANSPORT EXECUTION
      ↓
DOCUMENTS / POD
      ↓
TRIP COMPLETED
      ↓
COMMISSION / SETTLEMENT
      ↓
PAYMENT
```

---

# 10. Role Comparison

| Role | Focus | Primary Actions |
|---|---|---|
| Super Admin | Platform | Configure, manage, monitor |
| Business Owner | Business | Monitor, approve, decide |
| Manager | Operations | Plan, assign, dispatch, monitor |
| Accountant | Finance | Bill, pay, reconcile, report |
| Driver | Execution | Execute, update, document, deliver |
| Vendor | Partner Operations | Accept, execute, document, settle |

---

# 11. Same Data, Different Experience

A single trip should appear differently depending on the user's responsibility.

```text
                     TRIP #TRP-01015
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     OWNER              MANAGER           ACCOUNTANT
        │                  │                  │
   Revenue impact      Trip status       Invoice status
   Profitability       Driver            Receivable
   Business KPI        Vehicle           Payment
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────┴──────┐
                    ↓             ↓
                  DRIVER        VENDOR
                    │             │
               Route/status   Load/commission
               Documents      Settlement
               POD            Payment
```

The underlying record remains the same; the context, permissions, actions and information priority change.

---

# 12. Access Model

The product should follow a **least-access-required** approach.

```text
SUPER ADMIN
    │
    │ Platform-wide access
    ↓
BUSINESS OWNER
    │
    │ Business-wide access
    ├───────────────┐
    ↓               ↓
 MANAGER         ACCOUNTANT
    │               │
    ↓               ↓
 DRIVER          FINANCE DATA

VENDOR
    └── Restricted partner-level access
```

### Key Rule

External vendors and drivers should not automatically have access to the complete internal business system.

Users should only see data and actions required for their responsibilities.

---

# 13. Dashboard Philosophy

Each dashboard should answer one primary question:

```text
SUPER ADMIN
"Is the platform healthy?"
        ↓
BUSINESS OWNER
"How is my business performing?"
        ↓
MANAGER
"What needs operational attention?"
        ↓
ACCOUNTANT
"What needs financial action?"
        ↓
DRIVER
"What do I need to do now?"
        ↓
VENDOR
"What loads and payments do I have?"
```

---

# 14. Cross-Role Relationship

The six roles form one connected operational chain.

```text
SUPER ADMIN
     ↓
BUSINESS OWNER
     ↓
MANAGER
     ↓
DRIVER / VENDOR
     ↓
TRIP EXECUTION
     ↓
POD / COMPLETION
     ↓
ACCOUNTANT
     ↓
BILLING / SETTLEMENT
     ↓
BUSINESS OWNER
     ↓
REPORTING & DECISION
```

---

# 15. Key Design Decision

The TMS should be designed as:

> **One connected platform with role-specific workspaces, not six separate applications.**

All roles should work from a shared source of truth while seeing only the information, actions and workflows relevant to their responsibilities.

---

## Next Section

**03 — Information Architecture (IA)**

The IA will define:

**Modules → Navigation → Module grouping → Role visibility → Overall TMS structure**

