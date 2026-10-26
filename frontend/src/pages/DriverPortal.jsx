import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdPlayArrow, 
  MdCheckCircle, 
  MdCameraAlt, 
  MdLocalGasStation, 
  MdSync, 
  MdClose,
  MdMic,
  MdDirectionsCar,
  MdArrowBack,
  MdCheck,
  MdInfo,
  MdRefresh,
  MdNavigation,
  MdLocationPin,
  MdPerson,
  MdLocalShipping
} from 'react-icons/md';
import { 
  getOfflineQueue, 
  addToOfflineQueue, 
  syncOfflineData, 
  cacheDriverTrips, 
  getCachedDriverTrips 
} from '../utils/offlineStorage';
import './DriverPortal.css';

const DriverPortal = () => {
  const navigate = useNavigate();
  // Language state: 'en' or 'hi'
  const [lang, setLang] = useState('en'); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(getOfflineQueue().length);
  const [trips, setTrips] = useState(() => {
    try {
      const cached = getCachedDriverTrips();
      return Array.isArray(cached) ? cached.filter(tr => {
        const s = String(tr?.status || '').toLowerCase().trim();
        return s !== 'closed' && s !== 'completed' && s !== 'cancelled';
      }) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedTrip, setSelectedTrip] = useState(() => {
    try {
      const cached = getCachedDriverTrips();
      const active = Array.isArray(cached) ? cached.filter(tr => {
        const s = String(tr?.status || '').toLowerCase().trim();
        return s !== 'closed' && s !== 'completed' && s !== 'cancelled';
      }) : [];
      return active.length > 0 ? active[0] : null;
    } catch (e) {
      return null;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // In-App Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };
  
  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({ category: 'Fuel', amount: '', title: '' });
  const [driverExpenseWarning, setDriverExpenseWarning] = useState(null);
  
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [podFile, setPodFile] = useState(null);
  const [podPreview, setPodPreview] = useState(null);

  // Reached confirmation modal
  const [isReachModalOpen, setIsReachModalOpen] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);

  // Pure Localization Dictionaries (Strict English vs Strict Hindi)
  const dict = {
    en: {
      appName: 'Driver Portal',
      subtitle: 'Fast 4-Action Trip Hub',
      dashboardBtn: 'Dashboard',
      onlineStatus: 'ONLINE',
      offlineStatus: 'OFFLINE',
      offlineBannerTitle: 'Offline Mode (No Internet)',
      offlineBannerDesc: 'All actions are securely stored on this phone and will automatically sync when network is restored.',
      pendingSyncTitle: 'Offline Entries Pending',
      pendingSyncDesc: 'actions saved locally waiting to sync with server.',
      syncNow: 'Sync Now',
      selectTripLabel: 'Active Trip',
      tripsSuffix: 'Active Trips',
      refreshBtn: 'Refresh',
      noTripsTitle: 'No Active Trips Found',
      noTripsDesc: 'All assigned trips are either completed or closed. Check with your fleet manager for new assignments.',
      reloadBtn: 'Reload Trips',
      tripTag: 'TRIP',
      fromLabel: 'ORIGIN (FROM)',
      toLabel: 'DESTINATION (TO)',
      vehicleLabel: 'VEHICLE',
      partyLabel: 'PARTY / CLIENT',
      statusScheduled: 'Scheduled',
      statusInTransit: 'In Transit',
      statusCompleted: 'Completed',
      statusClosed: 'Closed',
      // 4 Main Buttons
      btn1Title: 'Start Trip',
      btn1Sub: 'Begin Journey',
      btn1InTransitTitle: 'In Transit',
      btn1InTransitSub: 'Trip is Active',
      btn1CompletedTitle: 'Completed',
      btn1CompletedSub: 'Trip Ended',
      btn2Title: 'Reached / Delivered',
      btn2Sub: 'Confirm Unloading',
      btn2DoneTitle: 'Delivered',
      btn2DoneSub: 'Goods Received',
      btn3Title: 'Upload POD',
      btn3Sub: 'Receipt / Bility Photo',
      btn4Title: 'Add Expense',
      btn4Sub: 'Diesel, Toll & Food',
      // Delivery Modal
      modalReachTitle: 'Confirm Delivery',
      modalReachQuestion: 'Have you arrived at the destination and successfully delivered the consignment? This trip will be marked as Delivered.',
      modalCancel: 'Cancel',
      modalConfirmDelivery: 'Yes, Mark Delivered',
      // Expense Modal
      modalExpenseTitle: 'Record Trip Expense',
      expenseCatLabel: 'Expense Category',
      catFuel: 'Diesel (Fuel)',
      catToll: 'Toll (FASTag / Cash)',
      catFood: 'Food & Daily Allowance',
      catRepair: 'Vehicle Repair & Tyre',
      catOther: 'Other Miscellaneous',
      expenseAmountLabel: 'Amount (₹)',
      expenseAmountPlaceholder: 'e.g. 2500',
      expenseDescLabel: 'Note / Details',
      expenseDescPlaceholder: 'e.g. 35 Ltr diesel at Indian Oil',
      speakBtn: 'Voice Input',
      speaking: 'Listening...',
      saveExpenseBtn: 'Save Expense',
      // POD Modal
      modalPodTitle: 'Upload Proof of Delivery (POD)',
      podPhotoPrompt: 'Take Photo or Choose Image',
      podPhotoHint: 'Click to capture signed bility, invoice or delivery challan',
      retakePhoto: 'Retake Photo',
      uploadPodBtn: 'Submit POD',
      // Toasts
      toastTripStarted: 'Trip started successfully! Status updated to In Transit.',
      toastTripDelivered: 'Trip marked as Delivered / Completed!',
      toastPodUploaded: 'Proof of Delivery (POD) uploaded successfully!',
      toastExpenseSaved: 'Expense recorded successfully!',
      toastOfflineStart: 'Saved offline: Trip marked In Transit. Will sync when online.',
      toastOfflineDelivered: 'Saved offline: Delivery recorded. Will sync when online.',
      toastOfflinePod: 'Saved offline: POD photo saved. Will upload when online.',
      toastOfflineExpense: 'Saved offline: Expense saved. Will sync when online.',
      toastOfflineGeneric: 'Saved to offline queue on this phone.',
      toastNoInternet: 'No internet connection right now.',
      toastSyncSuccess: 'offline updates synced successfully!',
      toastVoiceUnsupported: 'Voice typing is not supported by your browser.'
    },
    hi: {
      appName: 'ड्राइवर पोर्टल',
      subtitle: 'आसान 4-बटन ट्रिप कंट्रोल',
      dashboardBtn: 'डैशबोर्ड',
      onlineStatus: 'ऑनलाइन',
      offlineStatus: 'ऑफलाइन',
      offlineBannerTitle: 'ऑफलाइन मोड (इंटरनेट बंद)',
      offlineBannerDesc: 'सभी काम फोन में सुरक्षित हैं और नेटवर्क आते ही अपने आप सर्वर पर सिंक हो जाएंगे।',
      pendingSyncTitle: 'ऑफलाइन एंट्री पेंडिंग',
      pendingSyncDesc: 'एंट्री फोन में सुरक्षित हैं, सर्वर पर भेजना बाकी है।',
      syncNow: 'अभी सिंक करें',
      selectTripLabel: 'सक्रिय ट्रिप',
      tripsSuffix: 'सक्रिय ट्रिप्स',
      refreshBtn: 'रिफ्रेश',
      noTripsTitle: 'कोई सक्रिय ट्रिप नहीं मिली',
      noTripsDesc: 'सभी आवंटित ट्रिप पूरी या बंद हो चुकी हैं। नई ट्रिप के लिए ट्रांसपोर्ट ऑफिस से संपर्क करें।',
      reloadBtn: 'ट्रिप दोबारा लोड करें',
      tripTag: 'ट्रिप',
      fromLabel: 'कहाँ से (शुरुआत)',
      toLabel: 'कहाँ तक (गंतव्य)',
      vehicleLabel: 'गाड़ी नंबर',
      partyLabel: 'पार्टी / व्यापारी',
      statusScheduled: 'तैयार',
      statusInTransit: 'रास्ते में',
      statusCompleted: 'पूरी हुई',
      statusClosed: 'बंद',
      // 4 Main Buttons
      btn1Title: 'ट्रिप शुरू करें',
      btn1Sub: 'गाड़ी रवाना करें',
      btn1InTransitTitle: 'रास्ते में चालू',
      btn1InTransitSub: 'सफर प्रगति पर है',
      btn1CompletedTitle: 'ट्रिप समाप्त',
      btn1CompletedSub: 'सफर पूरा हुआ',
      btn2Title: 'पहुंच गए / माल उतारा',
      btn2Sub: 'डिलीवरी दर्ज करें',
      btn2DoneTitle: 'माल उतर गया',
      btn2DoneSub: 'डिलीवरी पूरी',
      btn3Title: 'बिल्टी / POD फोटो',
      btn3Sub: 'पावती रसीद अपलोड करें',
      btn4Title: 'खर्च / डीजल जोड़ें',
      btn4Sub: 'ईंधन, टोल व खाना',
      // Delivery Modal
      modalReachTitle: 'डिलीवरी की पुष्टि करें',
      modalReachQuestion: 'क्या आप सुरक्षित गंतव्य पर पहुंच गए हैं और माल उतार दिया गया है? यह ट्रिप पूरी (Completed) दर्ज हो जाएगी।',
      modalCancel: 'रद्द करें',
      modalConfirmDelivery: 'हाँ, माल उतर गया',
      // Expense Modal
      modalExpenseTitle: 'नया ट्रिप खर्च दर्ज करें',
      expenseCatLabel: 'खर्च का प्रकार',
      catFuel: 'डीजल (ईंधन)',
      catToll: 'टोल टैक्स (फास्टैग/नकद)',
      catFood: 'खाना व दैनिक भत्ता',
      catRepair: 'गाड़ी मरम्मत व टायर',
      catOther: 'अन्य फुटकर खर्च',
      expenseAmountLabel: 'राशि (₹)',
      expenseAmountPlaceholder: 'उदा. 2500',
      expenseDescLabel: 'विवरण / नोट',
      expenseDescPlaceholder: 'उदा. इंडियन ऑयल पंप पर 35 लीटर डीजल',
      speakBtn: 'बोलकर लिखें',
      speaking: 'सुन रहा हूँ...',
      saveExpenseBtn: 'खर्च सुरक्षित करें',
      // POD Modal
      modalPodTitle: 'पावती / बिल्टी (POD) अपलोड करें',
      podPhotoPrompt: 'फोटो लें या गैलरी से चुनें',
      podPhotoHint: 'दस्तखत की हुई बिल्टी या इनवॉइस की साफ़ फोटो खींचें',
      retakePhoto: 'दूसरी फोटो लें',
      uploadPodBtn: 'POD अपलोड करें',
      // Toasts
      toastTripStarted: 'ट्रिप शुरू हो गई! स्थिति "रास्ते में" दर्ज की गई।',
      toastTripDelivered: 'ट्रिप सफलतापूर्वक पूरी दर्ज की गई!',
      toastPodUploaded: 'बिल्टी (POD) फोटो सफलतापूर्वक अपलोड हो गई!',
      toastExpenseSaved: 'खर्च सफलतापूर्वक दर्ज हो गया!',
      toastOfflineStart: 'ऑफलाइन सेव: ट्रिप रास्ते में दर्ज हो गई। नेटवर्क पर सिंक होगी।',
      toastOfflineDelivered: 'ऑफलाइन सेव: डिलीवरी दर्ज हुई। नेटवर्क पर सिंक होगी।',
      toastOfflinePod: 'ऑफलाइन सेव: POD फोटो फोन में सुरक्षित है। नेटवर्क पर अपलोड होगी।',
      toastOfflineExpense: 'ऑफलाइन सेव: खर्च फोन में सुरक्षित है। नेटवर्क पर सिंक होगा।',
      toastOfflineGeneric: 'फोन की ऑफलाइन मेमोरी में सुरक्षित कर लिया गया है।',
      toastNoInternet: 'अभी इंटरनेट कनेक्शन उपलब्ध नहीं है।',
      toastSyncSuccess: 'ऑफलाइन एंट्री सर्वर पर सुरक्षित हो गईं!',
      toastVoiceUnsupported: 'आपके ब्राउज़र में बोलकर लिखने की सुविधा नहीं है।'
    }
  };

  const t = dict[lang];

  // Helper to test if a trip is closed/completed/cancelled
  const isInactiveTrip = (status) => {
    const s = String(status || '').toLowerCase().trim();
    return s === 'closed' || s === 'completed' || s === 'cancelled';
  };

  // Monitor Network Online / Offline Events
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      setQueueCount(getOfflineQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-queue-updated', handleQueueChange);

    fetchTrips();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-queue-updated', handleQueueChange);
    };
  }, []);

  const fetchTrips = async () => {
    if (navigator.onLine) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/v1/fleet/trips', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          // Filter out Closed, Completed and Cancelled trips - only ACTIVE trips shown to driver!
          const active = (Array.isArray(data) ? data : [])
            .filter(tr => !isInactiveTrip(tr.status))
            .sort((a, b) => (b.id || 0) - (a.id || 0));
          
          setTrips(active);
          cacheDriverTrips(active);
          if (active.length > 0) {
            setSelectedTrip(prev => {
              if (!prev) return active[0];
              const stillExists = active.find(x => x.id === prev.id);
              return stillExists || active[0];
            });
          } else {
            setSelectedTrip(null);
          }
          return;
        }
      } catch (e) {
        console.warn('Network fetch failed, falling back to cached trips:', e);
      }
    }

    // Fallback to local cache when offline or request fails (filter out closed trips too)
    const cached = getCachedDriverTrips().filter(tr => !isInactiveTrip(tr.status));
    setTrips(cached);
    if (cached.length > 0) {
      setSelectedTrip(prev => {
        if (!prev) return cached[0];
        const stillExists = cached.find(x => x.id === prev.id);
        return stillExists || cached[0];
      });
    } else {
      setSelectedTrip(null);
    }
  };

  const triggerSync = async () => {
    if (!navigator.onLine) {
      showToast(t.toastNoInternet, 'warning');
      return;
    }
    setIsSyncing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await syncOfflineData(token);
      setQueueCount(getOfflineQueue().length);
      if (res.syncedCount > 0) {
        showToast(`${res.syncedCount} ${t.toastSyncSuccess}`, 'success');
        fetchTrips();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. ACTION: Start Trip
  const handleStartTrip = async () => {
    if (!selectedTrip) return;
    const updatedPayload = { ...selectedTrip, status: 'In Transit' };

    if (!navigator.onLine) {
      addToOfflineQueue({
        type: 'STATUS_UPDATE',
        tripId: selectedTrip.id,
        payload: updatedPayload
      });
      setSelectedTrip(updatedPayload);
      showToast(t.toastOfflineStart, 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/fleet/trips/${selectedTrip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setSelectedTrip(saved);
        showToast(t.toastTripStarted, 'success');
        fetchTrips();
      }
    } catch (e) {
      addToOfflineQueue({
        type: 'STATUS_UPDATE',
        tripId: selectedTrip.id,
        payload: updatedPayload
      });
      setSelectedTrip(updatedPayload);
      showToast(t.toastOfflineGeneric, 'warning');
    }
  };

  // 2. ACTION: Reached / Delivered
  const handleReached = async () => {
    if (!selectedTrip) return;
    setIsReachModalOpen(false);

    const updatedPayload = { ...selectedTrip, status: 'Completed' };

    if (!navigator.onLine) {
      addToOfflineQueue({
        type: 'STATUS_UPDATE',
        tripId: selectedTrip.id,
        payload: updatedPayload
      });
      // Remove trip from active list as it is now completed
      setTrips(prev => prev.filter(x => x.id !== selectedTrip.id));
      setSelectedTrip(null);
      showToast(t.toastOfflineDelivered, 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/fleet/trips/${selectedTrip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedPayload)
      });
      if (res.ok) {
        showToast(t.toastTripDelivered, 'success');
        fetchTrips();
      }
    } catch (e) {
      addToOfflineQueue({
        type: 'STATUS_UPDATE',
        tripId: selectedTrip.id,
        payload: updatedPayload
      });
      setTrips(prev => prev.filter(x => x.id !== selectedTrip.id));
      setSelectedTrip(null);
      showToast(t.toastOfflineGeneric, 'warning');
    }
  };

  // 3. ACTION: Photo Upload (POD)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPodFile(file);
      const reader = new FileReader();
      reader.onload = () => setPodPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitPodPhoto = async () => {
    if (!selectedTrip || !podFile || !podPreview) return;

    if (!navigator.onLine) {
      addToOfflineQueue({
        type: 'POD_UPLOAD',
        tripId: selectedTrip.id,
        payload: {
          fileName: podFile.name,
          base64: podPreview
        }
      });
      setIsPodModalOpen(false);
      setPodFile(null);
      setPodPreview(null);
      showToast(t.toastOfflinePod, 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', podFile);

      const res = await fetch(`/api/trips/${selectedTrip.id}/pod`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (res.ok) {
        showToast(t.toastPodUploaded, 'success');
        setIsPodModalOpen(false);
        setPodFile(null);
        setPodPreview(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      addToOfflineQueue({
        type: 'POD_UPLOAD',
        tripId: selectedTrip.id,
        payload: {
          fileName: podFile.name,
          base64: podPreview
        }
      });
      setIsPodModalOpen(false);
      setPodFile(null);
      setPodPreview(null);
      showToast(t.toastOfflinePod, 'warning');
    }
  };

  // Live anomaly check for driver modal
  useEffect(() => {
    const amountVal = parseFloat(expenseData.amount);
    if (!amountVal || amountVal <= 0 || !isExpenseModalOpen) {
      setDriverExpenseWarning(null);
      return;
    }

    const timer = setTimeout(() => {
      const vehId = selectedTrip?.vehicle?.id ? `&vehicleId=${selectedTrip.vehicle.id}` : '';
      const tripId = selectedTrip?.id ? `&tripId=${selectedTrip.id}` : '';
      fetch(`/api/v1/finance/expenses/check-anomaly?category=${encodeURIComponent(expenseData.category)}&amount=${amountVal}${vehId}${tripId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.isFlagged) {
            setDriverExpenseWarning(data);
          } else {
            setDriverExpenseWarning(null);
          }
        })
        .catch(() => setDriverExpenseWarning(null));
    }, 400);

    return () => clearTimeout(timer);
  }, [expenseData.category, expenseData.amount, isExpenseModalOpen, selectedTrip]);

  // 4. ACTION: Add Expense
  const submitExpense = async (e) => {
    e.preventDefault();
    if (!selectedTrip || !expenseData.amount) return;

    const payload = {
      category: expenseData.category,
      amount: parseFloat(expenseData.amount),
      title: expenseData.title || `${expenseData.category} by Driver`,
      date: new Date().toISOString().split('T')[0],
      trip: { id: selectedTrip.id },
      vehicle: selectedTrip.vehicle ? { id: selectedTrip.vehicle.id } : null
    };

    if (!navigator.onLine) {
      addToOfflineQueue({
        type: 'EXPENSE',
        tripId: selectedTrip.id,
        payload
      });
      setIsExpenseModalOpen(false);
      setExpenseData({ category: 'Fuel', amount: '', title: '' });
      setDriverExpenseWarning(null);
      showToast(t.toastOfflineExpense, 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/finance/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved.isFlagged) {
          showToast(`⚠️ चेतावनी: असामान्य खर्च दर्ज हुआ (Flagged for Admin)`, 'warning');
        } else {
          showToast(t.toastExpenseSaved, 'success');
        }
        setIsExpenseModalOpen(false);
        setExpenseData({ category: 'Fuel', amount: '', title: '' });
        setDriverExpenseWarning(null);
      } else {
        throw new Error('Expense failed');
      }
    } catch (err) {
      addToOfflineQueue({
        type: 'EXPENSE',
        tripId: selectedTrip.id,
        payload
      });
      setIsExpenseModalOpen(false);
      setExpenseData({ category: 'Fuel', amount: '', title: '' });
      setDriverExpenseWarning(null);
      showToast(t.toastOfflineGeneric, 'warning');
    }
  };

  // Voice Note recognition
  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(t.toastVoiceUnsupported, 'warning');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setExpenseData(prev => ({
          ...prev,
          title: (prev.title ? prev.title + ' ' : '') + transcript
        }));
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Helper to extract clean city and address
  const getCleanRouteDisplay = () => {
    if (!selectedTrip) return { originCity: '-', originAddr: '', destCity: '-', destAddr: '' };
    const routeStr = selectedTrip.route || '';
    const parts = routeStr.split(/→|->|to|-/i);
    const originCity = (parts[0] || '').trim();
    const destCity = (parts.length > 1 ? parts[1] : '').trim();

    let originAddr = '';
    if (selectedTrip.pickupAddress) {
      const cleanPick = selectedTrip.pickupAddress.trim();
      if (!originCity || !cleanPick.toLowerCase().includes(originCity.toLowerCase())) {
        originAddr = cleanPick;
      } else if (cleanPick.length > originCity.length + 3) {
        originAddr = cleanPick.replace(new RegExp(originCity, 'ig'), '').replace(/^[\s,•-]+|[\s,•-]+$/g, '').trim();
      }
    }

    let destAddr = '';
    if (selectedTrip.deliveryAddress) {
      const cleanDeliv = selectedTrip.deliveryAddress.trim();
      if (!destCity || !cleanDeliv.toLowerCase().includes(destCity.toLowerCase())) {
        destAddr = cleanDeliv;
      } else if (cleanDeliv.length > destCity.length + 3) {
        destAddr = cleanDeliv.replace(new RegExp(destCity, 'ig'), '').replace(/^[\s,•-]+|[\s,•-]+$/g, '').trim();
      }
    }

    return { 
      originCity: originCity || selectedTrip.pickupAddress || 'Origin', 
      originAddr, 
      destCity: destCity || selectedTrip.deliveryAddress || 'Destination', 
      destAddr 
    };
  };

  const { originCity: dispOriginCity, originAddr: dispOriginAddr, destCity: dispDestCity, destAddr: dispDestAddr } = getCleanRouteDisplay();

  const getTripStatusLabel = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (s === 'in transit') return t.statusInTransit;
    if (s === 'completed') return t.statusCompleted;
    if (s === 'closed') return t.statusClosed;
    return t.statusScheduled;
  };

  return (
    <div className="driver-portal-wrapper">
      <div className="driver-portal-container">
        
        {/* Custom In-App Notification Toast */}
        {toast.show && (
          <div className="driver-toast-container">
            <div className={`driver-inapp-toast ${toast.type}`}>
              {toast.type === 'success' ? <MdCheck size={22} /> : <MdInfo size={22} />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Top App Bar Header */}
        <div className="driver-portal-header">
          <div className="header-left-group">
            <div className="driver-header-titles">
              <h2 className="driver-main-heading">
                <div className="driver-brand-logo-wrap">
                  <img src="/logo.png" alt="Driver Portal Logo" className="driver-brand-logo-img" />
                </div>
                {t.appName}
                <span className="driver-portal-pill">MOBILE DISPATCH</span>
              </h2>
            </div>
          </div>

          <div className="driver-header-actions">
            {/* Strict Language Switcher */}
            <button 
              type="button"
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="lang-switch-btn"
              title="Change Language / भाषा बदलें"
            >
              <span className="lang-icon">🌐</span>
              <span className="lang-text">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>
            
            {/* Live Connection Badge */}
            <div className={`driver-status-badge ${isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              <span>{isOnline ? t.onlineStatus : t.offlineStatus}</span>
              {queueCount > 0 && <span className="queue-counter-tag">{queueCount}</span>}
            </div>
          </div>
        </div>

        {/* Offline Alert Banner */}
        {(!isOnline || queueCount > 0) && (
          <div className="offline-alert-banner">
            <div className="offline-alert-content">
              <span className="offline-icon">📡</span>
              <div>
                <div className="offline-title">
                  {!isOnline ? t.offlineBannerTitle : `${t.pendingSyncTitle} (${queueCount})`}
                </div>
                <div className="offline-desc">
                  {!isOnline ? t.offlineBannerDesc : `${queueCount} ${t.pendingSyncDesc}`}
                </div>
              </div>
            </div>
            {isOnline && (
              <button 
                className="sync-now-btn" 
                onClick={triggerSync}
                disabled={isSyncing}
              >
                {isSyncing ? '...' : <><MdSync size={16} /> {t.syncNow}</>}
              </button>
            )}
          </div>
        )}

        {/* Active Trip Selector (Only Active, Non-Closed Trips) */}
        {trips.length > 0 && (
          <div className="trip-selector-card">
            <div className="trip-selector-top">
              <label className="selector-title">
                <MdLocalShipping size={18} style={{ color: 'var(--accent-color)', verticalAlign: 'middle', marginRight: '6px' }} /> {t.selectTripLabel} <span className="count-pill">({trips.length} {t.tripsSuffix})</span>
              </label>
              <button 
                type="button"
                onClick={fetchTrips}
                className="refresh-trips-btn"
              >
                <MdRefresh size={14} /> {t.refreshBtn}
              </button>
            </div>
            <select 
              value={selectedTrip?.id || ''} 
              onChange={(e) => {
                const found = trips.find(x => String(x.id) === e.target.value);
                if (found) setSelectedTrip(found);
              }}
              className="trip-select-dropdown"
            >
              {trips.map(tr => (
                <option key={tr.id} value={tr.id}>
                  {tr.tripNumber || `TRP-${tr.id}`} • {tr.clientName || tr.consignorName || 'Client'} ({tr.route || `${tr.pickupAddress} ➔ ${tr.deliveryAddress}`}) — [{getTripStatusLabel(tr.status)}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hero Active Trip Card */}
        {selectedTrip ? (
          <div className="trip-card-hero">
            <div className="trip-card-header">
              <div className="trip-title-chip">
                <span className="chip-prefix">{t.tripTag}</span>
                <span className="chip-number">{selectedTrip.tripNumber || `TRP-${selectedTrip.id}`}</span>
              </div>
              <span className={`trip-status-pill ${
                selectedTrip.status === 'Completed' ? 'completed' : 
                selectedTrip.status === 'In Transit' ? 'intransit' : 'scheduled'
              }`}>
                {getTripStatusLabel(selectedTrip.status)}
              </span>
            </div>

            {/* Visual Route Timeline */}
            <div className="trip-route-display">
              <div className="route-stop">
                <div className="route-dot origin">
                  <MdNavigation size={14} />
                </div>
                <div className="route-info">
                  <div className="route-label">{t.fromLabel}</div>
                  <div className="route-value">
                    <span className="route-city">{dispOriginCity}</span>
                    {dispOriginAddr && <span className="route-sub-addr">{dispOriginAddr}</span>}
                  </div>
                </div>
              </div>

              <div className="route-connector-line">
                <span className="route-line-pulse"></span>
              </div>
              
              <div className="route-stop">
                <div className="route-dot destination">
                  <MdLocationPin size={16} />
                </div>
                <div className="route-info">
                  <div className="route-label">{t.toLabel}</div>
                  <div className="route-value">
                    <span className="route-city">{dispDestCity}</span>
                    {dispDestAddr && <span className="route-sub-addr">{dispDestAddr}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats: Vehicle & Party */}
            <div className="trip-quick-stats">
              <div className="stat-pill">
                <div className="stat-icon-wrap"><MdDirectionsCar size={16} /></div>
                <div>
                  <span className="stat-label">{t.vehicleLabel}</span>
                  <strong className="stat-val">{selectedTrip.vehicle?.registrationNumber || 'MH-12-AB-1234'}</strong>
                </div>
              </div>
              <div className="stat-pill">
                <div className="stat-icon-wrap"><MdPerson size={16} /></div>
                <div>
                  <span className="stat-label">{t.partyLabel}</span>
                  <strong className="stat-val">{selectedTrip.clientName || selectedTrip.consignorName || 'General Cargo'}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-trips-card">
            <div className="no-trip-icon"><MdDirectionsCar size={48} /></div>
            <h3 className="no-trip-title">{t.noTripsTitle}</h3>
            <p className="no-trip-desc">{t.noTripsDesc}</p>
            <button 
              type="button" 
              onClick={fetchTrips}
              className="reload-trips-btn"
            >
              <MdRefresh size={18} /> {t.reloadBtn}
            </button>
          </div>
        )}

        {/* ========================================================
            THE 4 MAIN DRIVER ACTION BUTTONS (CLEAN & PURE LOCALIZED)
            ======================================================== */}
        <div className="action-grid-2x2">
          {/* BUTTON 1: START TRIP */}
          <button 
            type="button"
            className={`big-driver-btn btn-start-trip ${selectedTrip?.status === 'In Transit' ? 'is-active-transit' : ''}`}
            onClick={handleStartTrip}
            disabled={!selectedTrip || selectedTrip.status === 'In Transit' || selectedTrip.status === 'Completed'}
          >
            <div className="btn-icon-wrapper">
              <MdPlayArrow size={26} />
            </div>
            <span className="btn-primary-text">
              {selectedTrip?.status === 'In Transit' ? t.btn1InTransitTitle :
               selectedTrip?.status === 'Completed' ? t.btn1CompletedTitle : t.btn1Title}
            </span>
            <span className="btn-sub-text">
              {selectedTrip?.status === 'In Transit' ? t.btn1InTransitSub :
               selectedTrip?.status === 'Completed' ? t.btn1CompletedSub : t.btn1Sub}
            </span>
          </button>

          {/* BUTTON 2: REACHED / DELIVERED */}
          <button 
            type="button"
            className="big-driver-btn btn-reach-dest"
            onClick={() => setIsReachModalOpen(true)}
            disabled={!selectedTrip || selectedTrip.status === 'Completed'}
          >
            <div className="btn-icon-wrapper">
              <MdCheckCircle size={24} />
            </div>
            <span className="btn-primary-text">
              {selectedTrip?.status === 'Completed' ? t.btn2DoneTitle : t.btn2Title}
            </span>
            <span className="btn-sub-text">
              {selectedTrip?.status === 'Completed' ? t.btn2DoneSub : t.btn2Sub}
            </span>
          </button>

          {/* BUTTON 3: UPLOAD POD */}
          <button 
            type="button"
            className="big-driver-btn btn-upload-pod"
            onClick={() => setIsPodModalOpen(true)}
            disabled={!selectedTrip}
          >
            <div className="btn-icon-wrapper">
              <MdCameraAlt size={24} />
            </div>
            <span className="btn-primary-text">{t.btn3Title}</span>
            <span className="btn-sub-text">{t.btn3Sub}</span>
          </button>

          {/* BUTTON 4: ADD EXPENSE */}
          <button 
            type="button"
            className="big-driver-btn btn-add-expense"
            onClick={() => setIsExpenseModalOpen(true)}
            disabled={!selectedTrip}
          >
            <div className="btn-icon-wrapper">
              <MdLocalGasStation size={24} />
            </div>
            <span className="btn-primary-text">{t.btn4Title}</span>
            <span className="btn-sub-text">{t.btn4Sub}</span>
          </button>
        </div>

        {/* MODAL 1: ADD EXPENSE */}
        {isExpenseModalOpen && (
          <div className="driver-modal-overlay" onClick={() => setIsExpenseModalOpen(false)}>
            <div className="driver-modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-sheet-header">
                <span className="modal-sheet-title">⛽ {t.modalExpenseTitle}</span>
                <button 
                  type="button"
                  className="close-modal-btn" 
                  onClick={() => setIsExpenseModalOpen(false)}
                >
                  <MdClose size={20} />
                </button>
              </div>

              {driverExpenseWarning && driverExpenseWarning.isFlagged && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid #ef4444',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '20px' }}>🚨</span>
                  <div>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>
                      चेतावनी: असामान्य खर्च (High Expense Spike)
                    </div>
                    <div style={{ color: '#f1f5f9', fontSize: '12px', marginTop: '3px' }}>
                      {driverExpenseWarning.reason}
                    </div>
                    <div style={{ color: '#fbbf24', fontSize: '11px', marginTop: '4px' }}>
                      ℹ️ यह एंट्री रेड-फ्लैग के साथ कंपनी ऑफिस में दर्ज होगी।
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={submitExpense}>
                <div className="driver-form-group">
                  <label className="driver-form-label">{t.expenseCatLabel}</label>
                  <select 
                    className="driver-form-select"
                    value={expenseData.category}
                    onChange={e => setExpenseData({ ...expenseData, category: e.target.value })}
                  >
                    <option value="Fuel">{t.catFuel}</option>
                    <option value="Toll">{t.catToll}</option>
                    <option value="Food">{t.catFood}</option>
                    <option value="Repair">{t.catRepair}</option>
                    <option value="Other">{t.catOther}</option>
                  </select>
                </div>

                <div className="driver-form-group">
                  <label className="driver-form-label">{t.expenseAmountLabel} *</label>
                  <input 
                    type="number"
                    inputMode="decimal"
                    placeholder={t.expenseAmountPlaceholder}
                    required
                    className="driver-form-input amount-input"
                    value={expenseData.amount}
                    onChange={e => setExpenseData({ ...expenseData, amount: e.target.value })}
                  />
                </div>

                <div className="driver-form-group">
                  <div className="label-with-voice">
                    <label className="driver-form-label">{t.expenseDescLabel}</label>
                    <button 
                      type="button" 
                      onClick={toggleSpeech}
                      className={`voice-mic-btn ${isListening ? 'listening' : ''}`}
                    >
                      <MdMic size={15} />
                      <span>{isListening ? t.speaking : t.speakBtn}</span>
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder={t.expenseDescPlaceholder}
                    className="driver-form-input"
                    value={expenseData.title}
                    onChange={e => setExpenseData({ ...expenseData, title: e.target.value })}
                  />
                </div>

                <div className="modal-actions-row">
                  <button 
                    type="button" 
                    className="modal-btn-cancel"
                    onClick={() => setIsExpenseModalOpen(false)}
                  >
                    {t.modalCancel}
                  </button>
                  <button type="submit" className="modal-action-btn submit-orange">
                    💾 {t.saveExpenseBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: POD PHOTO UPLOAD */}
        {isPodModalOpen && (
          <div className="driver-modal-overlay" onClick={() => setIsPodModalOpen(false)}>
            <div className="driver-modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-sheet-header">
                <span className="modal-sheet-title">📸 {t.modalPodTitle}</span>
                <button 
                  type="button"
                  className="close-modal-btn" 
                  onClick={() => setIsPodModalOpen(false)}
                >
                  <MdClose size={20} />
                </button>
              </div>

              <div className="pod-upload-body">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {podPreview ? (
                  <div className="pod-preview-wrapper">
                    <img 
                      src={podPreview} 
                      alt="POD Preview" 
                      className="pod-preview-img"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="retake-photo-btn"
                    >
                      🔄 {t.retakePhoto}
                    </button>
                  </div>
                ) : (
                  <div 
                    className="camera-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="camera-icon-bubble">
                      <MdCameraAlt size={44} />
                    </div>
                    <div className="camera-prompt-title">{t.podPhotoPrompt}</div>
                    <div className="camera-prompt-hint">{t.podPhotoHint}</div>
                  </div>
                )}
              </div>

              <div className="modal-actions-row">
                <button 
                  type="button" 
                  className="modal-btn-cancel"
                  onClick={() => setIsPodModalOpen(false)}
                >
                  {t.modalCancel}
                </button>
                <button 
                  type="button" 
                  className="modal-action-btn submit-purple"
                  disabled={!podPreview}
                  onClick={submitPodPhoto}
                >
                  🚀 {t.uploadPodBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: REACHED / DELIVERED CONFIRMATION */}
        {isReachModalOpen && (
          <div className="driver-modal-overlay" onClick={() => setIsReachModalOpen(false)}>
            <div className="driver-modal-sheet reach-confirm-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-sheet-header">
                <span className="modal-sheet-title">🏁 {t.modalReachTitle}</span>
                <button 
                  type="button"
                  className="close-modal-btn" 
                  onClick={() => setIsReachModalOpen(false)}
                >
                  <MdClose size={20} />
                </button>
              </div>

              <div className="reach-confirm-body">
                <div className="reach-icon-badge">
                  <MdCheckCircle size={52} color="#10b981" />
                </div>
                <p className="reach-confirm-text">
                  {t.modalReachQuestion}
                </p>
              </div>

              <div className="modal-actions-row">
                <button 
                  type="button"
                  onClick={() => setIsReachModalOpen(false)}
                  className="modal-btn-cancel"
                >
                  {t.modalCancel}
                </button>
                <button 
                  type="button"
                  onClick={handleReached}
                  className="modal-action-btn submit-green"
                >
                  ✅ {t.modalConfirmDelivery}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DriverPortal;
