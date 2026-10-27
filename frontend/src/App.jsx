import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import Login from './pages/Login';
import Vehicles from './pages/Vehicles';
import AddVehicle from './pages/AddVehicle';
import VehicleDetails from './pages/VehicleDetails';
import EditVehicle from './pages/EditVehicle';
import Drivers from './pages/Drivers';
import DriverForm from './pages/DriverForm';
import DriverDetails from './pages/DriverDetails';
import Trips from './pages/Trips';
import TripForm from './pages/TripForm';
import TripDetails from './pages/TripDetails';
import EWayBillDetails from './pages/EWayBillDetails';
import LRList from './pages/LRList';
import LRForm from './pages/LRForm';
import LRDetails from './pages/LRDetails';
import LiveTracking from './pages/LiveTracking';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetails from './pages/InvoiceDetails';
import Expenses from './pages/Expenses';
import ExpenseForm from './pages/ExpenseForm';
import ExpenseDetails from './pages/ExpenseDetails';
import ProfitLoss from './pages/ProfitLoss';
import Loans from './pages/Loans';
import LoanForm from './pages/LoanForm';
import CashBank from './pages/CashBank';
import TransactionForm from './pages/TransactionForm';
import FuelList from './pages/FuelList';
import FuelForm from './pages/FuelForm';
import Vendors from './pages/Vendors';
import VendorForm from './pages/VendorForm';
import VendorDetails from './pages/VendorDetails';
import Inventory from './pages/Inventory';
import InventoryForm from './pages/InventoryForm';
import Attendance from './pages/Attendance';
import AttendanceForm from './pages/AttendanceForm';
import Payroll from './pages/Payroll';
import PayrollForm from './pages/PayrollForm';
import Staff from './pages/Staff';
import StaffForm from './pages/StaffForm';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import ExpenseReport from './pages/ExpenseReport';
import FuelReport from './pages/FuelReport';
import TripReport from './pages/TripReport';
import MaintenanceReport from './pages/MaintenanceReport';
import DocumentUpload from './pages/DocumentUpload';
import ContactMessages from './pages/ContactMessages';
import ContactMessageDetails from './pages/ContactMessageDetails';
import SystemSettings from './pages/SystemSettings';
import Notifications from './pages/Notifications';
import GST from './pages/GST';
import WhatsApp from './pages/WhatsApp';
import FastagTolls from './pages/FastagTolls';
import ApiDocs from './pages/ApiDocs';
import Appearance, { applyTheme, defaultTheme } from './pages/Appearance';
import UsersManagement from './pages/UsersManagement';
import Profile from './pages/Profile';
import AccessControl from './pages/AccessControl';
import DriverTrackingView from './pages/DriverTrackingView';
import Orders from './pages/Orders';
import AuditLogs from './pages/AuditLogs';
import PublicTracking from './pages/PublicTracking';
import SmartInsights from './pages/SmartInsights';
import DriverPortal from './pages/DriverPortal';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Default to clean enterprise 100% Light mode everywhere
    const saved = localStorage.getItem('tms_theme_settings');
    let settings = saved ? JSON.parse(saved) : defaultTheme;
    
    // If previous dark theme or dark sidebar was stored, upgrade to full light theme
    if (!saved || settings?.bgPrimary === '#0b0f17' || settings?.bgPrimary === '#121212' || settings?.sidebarBg === '#0f172a' || settings?.sidebarBg === '#0d131f') {
      settings = defaultTheme;
      localStorage.setItem('tms_theme_settings', JSON.stringify(defaultTheme));
    }
    applyTheme(settings);
  }, []);

  return (
    <AuthProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/track/:sessionId" element={<DriverTrackingView />} />
            <Route path="/public-track/:trackingId" element={<PublicTracking />} />
            <Route path="/driver-mobile" element={<DriverPortal />} />
            <Route path="/api/docs" element={<ApiDocs />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="new-trip" element={<NewTrip />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vehicles/create" element={<AddVehicle />} />
              <Route path="vehicles/:id" element={<VehicleDetails />} />
              <Route path="vehicles/:id/edit" element={<EditVehicle />} />
              
              <Route path="drivers" element={<Drivers />} />
              <Route path="drivers/create" element={<DriverForm />} />
              <Route path="drivers/:id" element={<DriverDetails />} />
              <Route path="drivers/:id/edit" element={<DriverForm />} />
              <Route path="driver-portal" element={<DriverPortal />} />
              
              <Route path="trips" element={<Trips />} />
              <Route path="trips/create" element={<TripForm />} />
              <Route path="trips/:id" element={<TripDetails />} />
              <Route path="trips/:id/edit" element={<TripForm />} />
              <Route path="trips/:id/eway-bill" element={<EWayBillDetails />} />
              <Route path="eway-bill/:id" element={<EWayBillDetails />} />
              
              <Route path="orders" element={<Orders />} />

              <Route path="lr" element={<LRList />} />
              <Route path="lr/create" element={<LRForm />} />
              <Route path="lr/:id" element={<LRDetails />} />
              <Route path="lr/:id/edit" element={<LRForm />} />

              <Route path="tracking" element={<LiveTracking />} />
              
              {/* Finance Module Routes */}
              <Route path="billing" element={<Invoices />} />
              <Route path="billing/create" element={<InvoiceForm />} />
              <Route path="billing/:id" element={<InvoiceDetails />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="expenses/create" element={<ExpenseForm />} />
              <Route path="expenses/:id" element={<ExpenseDetails />} />
              <Route path="profit-loss" element={<ProfitLoss />} />
              <Route path="loans" element={<Loans />} />
              <Route path="loans/create" element={<LoanForm />} />
              <Route path="cash-bank" element={<CashBank />} />
              <Route path="cash-bank/create" element={<TransactionForm />} />
              
              {/* Resources Module Routes */}
              <Route path="fuel" element={<FuelList />} />
              <Route path="fuel/create" element={<FuelForm />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendors/create" element={<VendorForm />} />
              <Route path="vendors/edit/:id" element={<VendorForm />} />
              <Route path="vendors/:id" element={<VendorDetails />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/create" element={<InventoryForm />} />
              
              {/* HR & Payroll Module Routes */}
              <Route path="attendance" element={<Attendance />} />
              <Route path="attendance/create" element={<AttendanceForm />} />
              <Route path="attendance/:id" element={<AttendanceForm />} />
              <Route path="attendance/:id/edit" element={<AttendanceForm />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="payroll/create" element={<PayrollForm />} />
              <Route path="payroll/:id" element={<PayrollForm />} />
              <Route path="payroll/:id/edit" element={<PayrollForm />} />
              <Route path="staff" element={<Staff />} />
              <Route path="staff/create" element={<StaffForm />} />
              <Route path="staff/:id" element={<StaffForm />} />
              <Route path="staff/:id/edit" element={<StaffForm />} />
              
              <Route path="documents" element={<Documents />} />
              <Route path="documents/create" element={<DocumentUpload />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/expenses" element={<ExpenseReport />} />
              <Route path="reports/fuel" element={<FuelReport />} />
              <Route path="reports/trips" element={<TripReport />} />
              <Route path="reports/maintenance" element={<MaintenanceReport />} />
              
              <Route path="contact-messages" element={<ContactMessages />} />
              <Route path="contact-messages/:id" element={<ContactMessageDetails />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              
              {/* New specific features */}
              <Route path="gst" element={<GST />} />
              <Route path="whatsapp" element={<WhatsApp />} />
              <Route path="fastag" element={<FastagTolls />} />
              <Route path="access-control" element={<AccessControl />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="profile" element={<Profile />} />
              <Route path="smart-insights" element={<SmartInsights />} />
              
              <Route path="*" element={
                <div style={{ padding: '24px', color: 'var(--text-primary)' }}>
                  <h2>Page Under Construction</h2>
                  <p>This section is being developed.</p>
                </div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
