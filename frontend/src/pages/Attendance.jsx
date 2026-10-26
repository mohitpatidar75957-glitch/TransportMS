import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdOpenInNew, 
  MdSave, 
  MdCheckCircle, 
  MdCancel, 
  MdCalendarToday, 
  MdAssessment, 
  MdAttachMoney, 
  MdTrendingDown, 
  MdAccountBalanceWallet,
  MdPerson
} from 'react-icons/md';
import './Attendance.css';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { showAlert, showConfirm } = useModal();
  const { roleKey, userRole } = useAuth();
  const isDriver = roleKey === 'DRIVER';
  const navigate = useNavigate();
  
  // Use local date (not UTC) to avoid timezone mismatch
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(today);

  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
  const [summaryMonth, setSummaryMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const [drivers, setDrivers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [managerList, setManagerList] = useState([]);

  const [allDriversData, setAllDriversData] = useState([]);
  const [allStaffData, setAllStaffData] = useState([]);
  const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [allManagersData, setAllManagersData] = useState([]);

  const [driverRecords, setDriverRecords] = useState([]);
  const [selfAttendance, setSelfAttendance] = useState(null); 
  const [loggedInDriverId, setLoggedInDriverId] = useState(null);
  const [loggedInDriverName, setLoggedInDriverName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllAdminData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/v1/fleet/drivers').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/v1/hr/staff').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/v1/hr/attendance').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/v1/hr/managers').then(res => res.ok ? res.json() : fetch('/api/users').then(r => r.ok ? r.json() : [])).catch(() => [])
    ])
    .then(([rawDrivers, rawStaff, rawAttendance, rawUsers]) => {
      const driversData = Array.isArray(rawDrivers) ? rawDrivers : (rawDrivers?.content || rawDrivers?.data || []);
      const staffData = Array.isArray(rawStaff) ? rawStaff : (rawStaff?.content || rawStaff?.data || []);
      const attendanceData = Array.isArray(rawAttendance) ? rawAttendance : (rawAttendance?.content || rawAttendance?.data || []);
      const usersData = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.content || rawUsers?.data || []);

      setAllDriversData(driversData);
      setAllStaffData(staffData);
      setAllAttendanceData(attendanceData);

      const managersData = usersData.filter(u => u && (u.role === 'MANAGER' || u.role === 'SUPER_ADMIN'));
      setAllManagersData(managersData);

      const dayAttendance = attendanceData.filter(a => a && a.date === selectedDate);
      
      const mappedDrivers = (driversData || []).map(d => {
        const att = dayAttendance.find(a => a.employeeType === 'Driver' && String(a.employeeId) === String(d.id));
        return {
          id: `DRV-${d.id}`,
          rawId: d.id,
          name: d.name,
          mobile: d.phone || d.mobile || 'N/A',
          vehicle: d.assignedVehicle ? (d.assignedVehicle.registrationNumber || d.assignedVehicle.licensePlate || 'Unassigned') : 'Unassigned',
          status: att ? att.status : '',
          remarks: ''
        };
      });
      
      const mappedStaff = (staffData || []).map(s => {
        const att = dayAttendance.find(a => a.employeeType === 'Staff' && String(a.employeeId) === String(s.id));
        return {
          id: `STF-${s.id}`,
          rawId: s.id,
          name: s.name,
          role: s.role,
          mobile: s.phone || '-',
          status: att ? att.status : ''
        };
      });

      const mappedManagers = managersData.map(m => {
        const att = dayAttendance.find(a => (a.employeeType === 'Manager' || a.employeeType === 'Admin') && String(a.employeeId) === String(m.id));
        return {
          id: `MGR-${m.id}`,
          rawId: m.id,
          name: m.name,
          role: m.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operations Manager',
          mobile: m.phone || 'N/A',
          status: att ? att.status : '',
          remarks: ''
        };
      });
      
      setDrivers(mappedDrivers);
      setStaffList(mappedStaff);
      setManagerList(mappedManagers);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (isDriver) {
      setIsLoading(true);
      fetch('/api/v1/fleet/drivers')
        .then(res => res.json())
        .then(drivers => {
          const me = drivers.find(d => d?.name?.toLowerCase()?.includes('mohit')) 
                  || drivers.find(d => d?.id === 11) 
                  || drivers[0];
          
          if (me) {
            setLoggedInDriverId(me.id);
            setLoggedInDriverName(me.name);
            return fetch('/api/v1/hr/attendance').then(res => res.json()).then(data => ({ data, myId: me.id }));
          }
          return null;
        })
        .then(result => {
          if (result) {
            const { data, myId } = result;
            const myData = data.filter(a => a.employeeType === 'Driver' && a.employeeId === myId);
            setDriverRecords(myData);
            
            const todayRecord = myData.find(a => a.date === today);
            if (todayRecord) {
              setSelfAttendance(todayRecord.status);
            }
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else {
      fetchAllAdminData();
    }
  }, [isDriver, today, selectedDate]);

  // Driver calendar view state
  const currentMonth = new Date();
  const [viewMonth, setViewMonth] = useState(currentMonth.getMonth());
  const [viewYear, setViewYear] = useState(currentMonth.getFullYear());

  const handleDriverStatusChange = (id, status) => {
    setDrivers(prev =>
      prev.map(d => d.id === id ? { ...d, status: d.status === status ? '' : status } : d)
    );
  };

  const handleDriverRemarksChange = (id, remarks) => {
    setDrivers(prev =>
      prev.map(d => d.id === id ? { ...d, remarks } : d)
    );
  };

  const handleStaffStatusChange = (id, status) => {
    setStaffList(prev =>
      prev.map(s => s.id === id ? { ...s, status: s.status === status ? '' : status } : s)
    );
  };

  const handleManagerStatusChange = (id, status) => {
    setManagerList(prev =>
      prev.map(m => m.id === id ? { ...m, status: m.status === status ? '' : status } : m)
    );
  };

  const handleManagerRemarksChange = (id, remarks) => {
    setManagerList(prev =>
      prev.map(m => m.id === id ? { ...m, remarks } : m)
    );
  };

  const handleMarkPresent = async () => {
    if (!loggedInDriverId) return;
    setSelfAttendance('P');
    try {
      await fetch('/api/v1/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          employeeType: 'Driver',
          employeeId: loggedInDriverId,
          employeeName: loggedInDriverName,
          status: 'P'
        })
      });
      
      setDriverRecords(prev => [...prev, {
        date: today,
        employeeType: 'Driver',
        employeeId: loggedInDriverId,
        employeeName: loggedInDriverName,
        status: 'P'
      }]);
      
      showAlert('✅ Attendance marked as Present for today!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      showAlert('Attendance saved locally.');
    }
  };

  const handleSaveAll = async () => {
    try {
      const recordsToPost = [];
      
      drivers.forEach(d => {
        if (d.status) {
          recordsToPost.push({
            date: selectedDate,
            employeeType: 'Driver',
            employeeId: parseInt(d.id.replace('DRV-', '')) || 0,
            employeeName: d.name,
            status: d.status
          });
        }
      });
      
      staffList.forEach(s => {
        if (s.status) {
          recordsToPost.push({
            date: selectedDate,
            employeeType: 'Staff',
            employeeId: parseInt(s.id.replace('STF-', '')) || 0,
            employeeName: s.name,
            status: s.status
          });
        }
      });

      managerList.forEach(m => {
        if (m.status) {
          recordsToPost.push({
            date: selectedDate,
            employeeType: 'Manager',
            employeeId: m.rawId,
            employeeName: m.name,
            status: m.status
          });
        }
      });

      let successCount = 0;
      for (const record of recordsToPost) {
        const response = await fetch('/api/v1/hr/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        if (response.ok) successCount++;
      }
      
      showAlert(`Attendance saved successfully! (${successCount} records)`);
      fetchAllAdminData(); // Refresh summary calculations
    } catch (error) {
      console.error('Error saving attendance:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  // Calculate monthly attendance stats helper
  const calculateMonthlyStats = (empId, empType, baseSal = 25000) => {
    const monthPrefix = summaryMonth; 
    const monthRecords = allAttendanceData.filter(a => 
      a.employeeType === empType && 
      String(a.employeeId) === String(empId) &&
      a.date && String(a.date).startsWith(monthPrefix)
    );

    const presentCount = monthRecords.filter(r => r.status === 'P' || r.status === 'Present').length;
    const absentCount = monthRecords.filter(r => r.status === 'A' || r.status === 'Absent').length;
    const leaveCount = monthRecords.filter(r => r.status === 'L' || r.status === 'Leave').length;

    const daysInMonth = 30; // standard 30-day calculation
    const dailyRate = Math.round(baseSal / daysInMonth);
    const deduction = absentCount * dailyRate;
    const netPayable = Math.max(0, baseSal - deduction);

    return {
      presentCount,
      absentCount,
      leaveCount,
      baseSal,
      dailyRate,
      deduction,
      netPayable
    };
  };

  // ============================
  // DRIVER SELF-VIEW
  // ============================
  if (isDriver) {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthName = new Date(viewYear, viewMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
    const isCurrentMonth = viewYear === currentMonth.getFullYear() && viewMonth === currentMonth.getMonth();

    const getMonthDays = () => {
      const days = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth, d);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayOfWeek = date.getDay();
        const isSunday = dayOfWeek === 0;
        const isFuture = dateStr > today; 
        const isCurrentDay = dateStr === today;

        let status = '';
        if (isSunday) {
          status = 'off';
        } else if (isCurrentDay) {
          if (isLoading) status = 'loading';
          else status = selfAttendance === 'P' ? 'present' : 'pending';
        } else if (isFuture) {
          status = 'upcoming';
        } else {
          const record = driverRecords.find(r => r.date === dateStr);
          if (record && record.status === 'P') status = 'present';
          else if (record && record.status === 'A') status = 'absent';
          else status = 'no-record'; 
        }

        days.push({ day: d, date: dateStr, status, isSunday, isFuture, isToday: isCurrentDay });
      }
      return days;
    };

    const monthDays = getMonthDays();
    const todayMarked = selfAttendance === 'P';

    const handlePrevMonth = () => {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
      else setViewMonth(viewMonth - 1);
    };
    const handleNextMonth = () => {
      if (isCurrentMonth) return;
      if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    };

    const getCellStyle = (d) => {
      const base = {
        textAlign: 'center', padding: '12px 4px', borderRadius: '10px',
        cursor: 'default', transition: 'all 0.2s ease', minHeight: '64px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
      };
      if (d.isToday) return { ...base, background: 'rgba(9,132,227,0.12)', border: '2px solid rgba(9,132,227,0.4)' };
      if (d.status === 'off') return { ...base, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' };
      if (d.status === 'present') return { ...base, background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.15)' };
      if (d.status === 'upcoming') return { ...base, background: 'transparent', border: '1px solid rgba(255,255,255,0.04)' };
      return { ...base, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' };
    };

    const getStatusBadge = (d) => {
      if (d.status === 'loading') return <span className="spinner" style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', marginTop: '2px' }}></span>;
      if (d.status === 'off') return <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>OFF</span>;
      if (d.status === 'present') return <span style={{ fontSize: '0.6rem', color: '#2ed573', fontWeight: 700 }}>✓</span>;
      if (d.status === 'pending') return <span style={{ fontSize: '0.55rem', color: '#ffa502', fontWeight: 600 }}>PENDING</span>;
      if (d.status === 'upcoming') return <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.1)' }}>—</span>;
      if (d.status === 'no-record') return <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>—</span>;
      return null;
    };

    return (
      <div className="attendance-container">
        <div className="attendance-panel">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(9,132,227,0.06), rgba(108,92,231,0.04))',
            border: '1px solid rgba(9,132,227,0.1)', marginBottom: '20px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 700 }}>My Attendance</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {!isLoading && (
              todayMarked ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '10px',
                  background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.2)',
                  color: '#2ed573', fontWeight: 600, fontSize: '0.85rem'
                }}>
                  Present
                </div>
              ) : (
                <button onClick={handleMarkPresent} style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
                  color: 'white', fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(9,132,227,0.25)',
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <MdCheckCircle size={18} /> Mark Present
                </button>
              )
            )}
          </div>

          {!isLoading && !todayMarked && (
            <div style={{
              padding: '12px 20px', borderRadius: '10px', marginBottom: '20px',
              background: 'rgba(255,165,2,0.06)', border: '1px solid rgba(255,165,2,0.12)',
              display: 'flex', alignItems: 'center', gap: '10px',
              color: '#ffa502', fontSize: '0.82rem'
            }}>
              <span style={{ fontSize: '1.1rem' }}>⏳</span>
              You haven't marked your attendance today. If not marked by end of day, it will be counted as <strong style={{ marginLeft: '3px' }}>Absent</strong>.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <button onClick={handlePrevMonth} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-primary)', width: '34px', height: '34px', borderRadius: '8px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', transition: 'all 0.2s'
            }}>◀</button>
            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.3px' }}>
              {monthName}
            </h4>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '20px',
            padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '0.62rem', fontWeight: 700,
                color: d === 'SUN' ? 'rgba(255,107,129,0.6)' : 'rgba(255,255,255,0.3)',
                letterSpacing: '0.8px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '4px'
              }}>{d}</div>
            ))}

            {Array.from({ length: firstDayOffset }, (_, i) => (
              <div key={`e-${i}`} style={{ minHeight: '52px' }}></div>
            ))}

            {monthDays.map(d => (
              <div key={d.day} style={getCellStyle(d)}>
                <span style={{
                  fontSize: '0.82rem', fontWeight: d.isToday ? 700 : 500,
                  color: d.isToday ? '#74b9ff' : d.isSunday ? 'rgba(255,107,129,0.5)' : d.isFuture ? 'rgba(255,255,255,0.15)' : 'var(--text-primary)'
                }}>{d.day}</span>
                {getStatusBadge(d)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // ADMIN / MANAGER VIEW
  // ============================
  if (isLoading) {
    return (
      <div className="attendance-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          Loading attendance records...
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Monthly aggregated data calculation
  const monthlyDriverList = allDriversData.map(d => {
    const sal = d.salaryAmount || 25000;
    const stats = calculateMonthlyStats(d.id, 'Driver', sal);
    return {
      id: d.id,
      type: 'Driver',
      name: d.name,
      mobile: d.phone || d.mobile || 'N/A',
      role: 'Driver',
      ...stats
    };
  });

  const monthlyStaffList = allStaffData.map(s => {
    const sal = s.salary || 30000;
    const stats = calculateMonthlyStats(s.id, 'Staff', sal);
    return {
      id: s.id,
      type: 'Staff',
      name: s.name,
      mobile: s.phone || '-',
      role: s.role || 'Staff',
      ...stats
    };
  });

  const monthlyManagerList = allManagersData.map(m => {
    const sal = 45000;
    const stats = calculateMonthlyStats(m.id, 'Manager', sal);
    return {
      id: m.id,
      type: 'Manager',
      name: m.name,
      mobile: m.phone || 'N/A',
      role: m.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operations Manager',
      ...stats
    };
  });

  const allMonthlyEmployees = [...monthlyDriverList, ...monthlyManagerList, ...monthlyStaffList];

  const totalEmployeesCount = allMonthlyEmployees.length;
  const totalPresentSum = allMonthlyEmployees.reduce((sum, e) => sum + e.presentCount, 0);
  const totalAbsentSum = allMonthlyEmployees.reduce((sum, e) => sum + e.absentCount, 0);
  const totalDeductionSum = allMonthlyEmployees.reduce((sum, e) => sum + e.deduction, 0);

  return (
    <div className="attendance-container">
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      {/* Prominent Page Header with View Switcher Tabs */}
      <div className="panel" style={{ padding: '16px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Attendance & Leave Management</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Track daily attendance and monthly salary deductions for drivers, managers & staff</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode('daily')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: viewMode === 'daily' ? '1px solid #2563eb' : '1px solid var(--border-color)',
              background: viewMode === 'daily' ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: viewMode === 'daily' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: viewMode === 'daily' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <MdCalendarToday size={16} /> Mark Daily Attendance
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: viewMode === 'monthly' ? '1px solid #2563eb' : '1px solid var(--border-color)',
              background: viewMode === 'monthly' ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: viewMode === 'monthly' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: viewMode === 'monthly' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <MdAssessment size={18} /> Monthly Summary & Salary Cut
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        /* DAILY ATTENDANCE MARKING PANEL */
        <div className="attendance-panel">
          <div className="attendance-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Attendance Date:</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ 
                  padding: '8px 14px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-surface)', 
                  color: 'var(--text-primary)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
            </div>
            <button className="save-attendance-btn" onClick={handleSaveAll}>
              Save Attendance
            </button>
          </div>

          {/* 1. Drivers Table */}
          <div className="staff-section-divider">
            <h3>Drivers Section</h3>
          </div>
          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>DRIVER NAME</th>
                  <th>MOBILE</th>
                  <th>ASSIGNED VEHICLE</th>
                  <th>STATUS</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      No drivers registered in the fleet yet.
                    </td>
                  </tr>
                ) : (
                  drivers.map(driver => (
                  <tr key={driver.id}>
                    <td>
                      <span className="driver-name-link" onClick={() => navigate(`/drivers/${driver.rawId}`)}>
                        {driver.name} <MdOpenInNew size={14} className="link-icon" />
                      </span>
                    </td>
                    <td>{driver.mobile}</td>
                    <td>{driver.vehicle}</td>
                    <td>
                      <div className="status-toggle-group">
                        <button
                          className={`status-toggle-btn present ${driver.status === 'P' ? 'active' : ''}`}
                          onClick={() => handleDriverStatusChange(driver.id, 'P')}
                          title="Present"
                        >P</button>
                        <button
                          className={`status-toggle-btn absent ${driver.status === 'A' ? 'active' : ''}`}
                          onClick={() => handleDriverStatusChange(driver.id, 'A')}
                          title="Absent"
                        >A</button>
                        <button
                          className={`status-toggle-btn leave-btn ${driver.status === 'L' ? 'active' : ''}`}
                          onClick={() => handleDriverStatusChange(driver.id, 'L')}
                          title="Leave"
                        >L</button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="remarks-input"
                        placeholder="Optional notes"
                        value={driver.remarks}
                        onChange={e => handleDriverRemarksChange(driver.id, e.target.value)}
                      />
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {/* 2. Managers & Operations Section */}
          <div className="staff-section-divider">
            <h3>Managers & Operations</h3>
          </div>
          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>MANAGER NAME</th>
                  <th>ROLE</th>
                  <th>MOBILE</th>
                  <th>STATUS</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {managerList.map(manager => (
                  <tr key={manager.id}>
                    <td>
                      <span className="staff-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{manager.name}</span>
                    </td>
                    <td>
                      <span 
                        className={`role-badge ${manager.role?.toUpperCase().includes('SUPER') ? 'super-admin' : 'manager'}`}
                      >
                        {manager.role}
                      </span>
                    </td>
                    <td>{manager.mobile}</td>
                    <td>
                      <div className="status-toggle-group">
                        <button
                          className={`status-toggle-btn present ${manager.status === 'P' ? 'active' : ''}`}
                          onClick={() => handleManagerStatusChange(manager.id, 'P')}
                          title="Present"
                        >P</button>
                        <button
                          className={`status-toggle-btn absent ${manager.status === 'A' ? 'active' : ''}`}
                          onClick={() => handleManagerStatusChange(manager.id, 'A')}
                          title="Absent"
                        >A</button>
                        <button
                          className={`status-toggle-btn leave-btn ${manager.status === 'L' ? 'active' : ''}`}
                          onClick={() => handleManagerStatusChange(manager.id, 'L')}
                          title="Leave"
                        >L</button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="remarks-input"
                        placeholder="Optional notes"
                        value={manager.remarks}
                        onChange={e => handleManagerRemarksChange(manager.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Staff & Labor Section */}
          <div className="staff-section-divider">
            <h3>Staff & Labor</h3>
          </div>

          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>EMPLOYEE NAME</th>
                  <th>ROLE</th>
                  <th>MOBILE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff.id}>
                    <td>
                      <span className="staff-name">{staff.name}</span>
                    </td>
                    <td>
                      <span 
                        className={`role-badge ${
                          staff.role?.toUpperCase().includes('ACCOUNT') ? 'accountant' :
                          staff.role?.toUpperCase().includes('DISPATCH') ? 'dispatcher' :
                          staff.role?.toUpperCase().includes('HR') ? 'hr' : 'default-role'
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td>{staff.mobile || '-'}</td>
                    <td>
                      <div className="status-toggle-group">
                        <button
                          className={`status-toggle-btn present ${staff.status === 'P' ? 'active' : ''}`}
                          onClick={() => handleStaffStatusChange(staff.id, 'P')}
                          title="Present"
                        >P</button>
                        <button
                          className={`status-toggle-btn absent ${staff.status === 'A' ? 'active' : ''}`}
                          onClick={() => handleStaffStatusChange(staff.id, 'A')}
                          title="Absent"
                        >A</button>
                        <button
                          className={`status-toggle-btn leave-btn ${staff.status === 'L' ? 'active' : ''}`}
                          onClick={() => handleStaffStatusChange(staff.id, 'L')}
                          title="Leave"
                        >L</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="attendance-footer">
            <button className="save-all-btn" onClick={handleSaveAll}>
              <MdSave size={18} />
              Save All Records
            </button>
          </div>
        </div>
      ) : (
        /* MONTHLY SUMMARY & SALARY DEDUCTION REPORT VIEW */
        <div>
          {/* Month Selector & Header */}
          <div className="panel" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>
                Monthly Attendance & Salary Deductions
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                Auto-calculates daily rate deductions based on driver, manager & staff absent days
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>Select Month:</span>
              <input
                type="month"
                value={summaryMonth}
                onChange={e => setSummaryMonth(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  colorScheme: 'dark',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* KPI Overview Cards */}
          <div className="summary-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #0984e3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Employees</span>
                <MdPerson size={20} style={{ color: '#0984e3' }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalEmployeesCount}</p>
            </div>
            
            <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #2ed573' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Present Days</span>
                <MdCheckCircle size={20} style={{ color: '#2ed573' }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#2ed573' }}>{totalPresentSum} Days</p>
            </div>

            <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #ff4757' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Absent Days</span>
                <MdCancel size={20} style={{ color: '#ff4757' }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ff4757' }}>{totalAbsentSum} Days</p>
            </div>

            <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #e67e22' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Salary Cut</span>
                <MdTrendingDown size={20} style={{ color: '#e67e22' }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#e67e22' }}>₹{totalDeductionSum.toLocaleString()}</p>
            </div>
          </div>

          {/* Monthly Attendance Table */}
          <div className="table-container panel">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EMPLOYEE / ROLE</th>
                  <th>BASE SALARY</th>
                  <th>PRESENT (P)</th>
                  <th>ABSENT (A)</th>
                  <th>LEAVE (L)</th>
                  <th>DAILY RATE</th>
                  <th>SALARY CUT (ABSENT)</th>
                  <th>ESTIMATED NET</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {allMonthlyEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      No employee attendance records found for this month.
                    </td>
                  </tr>
                ) : (
                  allMonthlyEmployees.map(emp => (
                    <tr key={`${emp.type}-${emp.id}`}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</span>
                          <span style={{ fontSize: '11px', color: emp.type === 'Driver' ? '#3742fa' : emp.type === 'Manager' ? '#6c5ce7' : '#e056fd' }}>{emp.role}</span>
                        </div>
                      </td>
                      <td>₹{Number(emp.baseSal).toLocaleString()}</td>
                      <td>
                        <span style={{
                          backgroundColor: 'rgba(46, 213, 115, 0.15)',
                          color: '#2ed573',
                          border: '1px solid rgba(46, 213, 115, 0.4)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {emp.presentCount} P
                        </span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: 'rgba(255, 71, 87, 0.15)',
                          color: '#ff4757',
                          border: '1px solid rgba(255, 71, 87, 0.4)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {emp.absentCount} A
                        </span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: 'rgba(251, 197, 49, 0.15)',
                          color: '#f39c12',
                          border: '1px solid rgba(251, 197, 49, 0.4)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {emp.leaveCount} L
                        </span>
                      </td>
                      <td>₹{emp.dailyRate.toLocaleString()} / day</td>
                      <td>
                        <span style={{ color: emp.deduction > 0 ? '#ff4757' : 'var(--text-secondary)', fontWeight: emp.deduction > 0 ? 700 : 400 }}>
                          {emp.deduction > 0 ? `-₹${emp.deduction.toLocaleString()}` : '₹0'}
                        </span>
                      </td>
                      <td style={{ color: '#2ed573', fontWeight: 700 }}>₹{emp.netPayable.toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => navigate('/payroll')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '18px',
                            border: '1px solid #0984e3',
                            backgroundColor: 'rgba(9, 132, 227, 0.15)',
                            color: '#0984e3',
                            fontWeight: '600',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0984e3';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(9, 132, 227, 0.15)';
                            e.currentTarget.style.color = '#0984e3';
                          }}
                          title="Go to Payroll to process salary payment"
                        >
                          <MdAccountBalanceWallet size={14} /> Process Salary
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
