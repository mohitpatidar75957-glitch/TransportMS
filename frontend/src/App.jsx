import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Route-based code splitting (Lazy Loading) for ultra-fast initial page loads
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewTrip = lazy(() => import('./pages/NewTrip'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const AddVehicle = lazy(() => import('./pages/AddVehicle'));
const VehicleDetails = lazy(() => import('./pages/VehicleDetails'));
const EditVehicle = lazy(() => import('./pages/EditVehicle'));
const Drivers = lazy(() => import('./pages/Drivers'));
const DriverForm = lazy(() => import('./pages/DriverForm'));
const DriverDetails = lazy(() => import('./pages/DriverDetails'));
const DriverPortal = lazy(() => import('./pages/DriverPortal'));
const Trips = lazy(() => import('./pages/Trips'));
const TripForm = lazy(() => import('./pages/TripForm'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const EWayBillDetails = lazy(() => import('./pages/EWayBillDetails'));
const Orders = lazy(() => import('./pages/Orders'));
const LRList = lazy(() => import('./pages/LRList'));
const LRForm = lazy(() => import('./pages/LRForm'));
const LRDetails = lazy(() => import('./pages/LRDetails'));
const LiveTracking = lazy(() => import('./pages/LiveTracking'));
const DriverTrackingView = lazy(() => import('./pages/DriverTrackingView'));
const PublicTracking = lazy(() => import('./pages/PublicTracking'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceForm = lazy(() => import('./pages/InvoiceForm'));
const InvoiceDetails = lazy(() => import('./pages/InvoiceDetails'));
const Expenses = lazy(() => import('./pages/Expenses'));
const ExpenseForm = lazy(() => import('./pages/ExpenseForm'));
const ExpenseDetails = lazy(() => import('./pages/ExpenseDetails'));
const ProfitLoss = lazy(() => import('./pages/ProfitLoss'));
const Loans = lazy(() => import('./pages/Loans'));
const LoanForm = lazy(() => import('./pages/LoanForm'));
const CashBank = lazy(() => import('./pages/CashBank'));
const TransactionForm = lazy(() => import('./pages/TransactionForm'));
const FuelList = lazy(() => import('./pages/FuelList'));
const FuelForm = lazy(() => import('./pages/FuelForm'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VendorForm = lazy(() => import('./pages/VendorForm'));
const VendorDetails = lazy(() => import('./pages/VendorDetails'));
const Inventory = lazy(() => import('./pages/Inventory'));
const InventoryForm = lazy(() => import('./pages/InventoryForm'));
const Attendance = lazy(() => import('./pages/Attendance'));
const AttendanceForm = lazy(() => import('./pages/AttendanceForm'));
const Payroll = lazy(() => import('./pages/Payroll'));
const PayrollForm = lazy(() => import('./pages/PayrollForm'));
const Staff = lazy(() => import('./pages/Staff'));
const StaffForm = lazy(() => import('./pages/StaffForm'));
const Documents = lazy(() => import('./pages/Documents'));
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'));
const Reports = lazy(() => import('./pages/Reports'));
const ExpenseReport = lazy(() => import('./pages/ExpenseReport'));
const FuelReport = lazy(() => import('./pages/FuelReport'));
const TripReport = lazy(() => import('./pages/TripReport'));
const MaintenanceReport = lazy(() => import('./pages/MaintenanceReport'));
const ContactMessages = lazy(() => import('./pages/ContactMessages'));
const ContactMessageDetails = lazy(() => import('./pages/ContactMessageDetails'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const GST = lazy(() => import('./pages/GST'));
const WhatsApp = lazy(() => import('./pages/WhatsApp'));
const FastagTolls = lazy(() => import('./pages/FastagTolls'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
import Appearance, { applyTheme, defaultTheme } from './pages/Appearance';
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const Profile = lazy(() => import('./pages/Profile'));
const AccessControl = lazy(() => import('./pages/AccessControl'));
const SmartInsights = lazy(() => import('./pages/SmartInsights'));

// Elegant lightweight spinner for suspense loading
const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '14px'
  }}>
    <div style={{
      width: '38px',
      height: '38px',
      border: '3px solid rgba(2, 132, 199, 0.15)',
      borderTop: '3px solid #0284c7',
      borderRadius: '50%',
      animation: 'appSpin 0.7s linear infinite'
    }} />
    <style>{`@keyframes appSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', fontWeight: '500' }}>
      Loading module...
    </span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Default to clean enterprise Light mode everywhere
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
          <Suspense fallback={<PageLoader />}>
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
                
                {/* Specific features */}
                <Route path="gst" element={<GST />} />
                <Route path="whatsapp" element={<WhatsApp />} />
                <Route path="fastag" element={<FastagTolls />} />
                <Route path="access-control" element={<AccessControl />} />
                <Route path="appearance" element={<Appearance />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="smart-insights" element={<SmartInsights />} />
                
                <Route path="*" element={
                  <div style={{ padding: '24px', color: 'var(--text-primary)' }}>
                    <h2>Page Under Construction</h2>
                    <p>This section is being developed.</p>
                  </div>
                } />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
