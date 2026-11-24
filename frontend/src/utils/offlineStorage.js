/**
 * Offline Storage & Synchronization Utility for Drivers
 * Enables drivers to work seamlessly in zero-connectivity areas (highways, forests, remote locations)
 */

const QUEUE_KEY = 'tms_driver_offline_queue';
const CACHE_KEY = 'tms_driver_cached_trips';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
};

export const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('offline-queue-updated'));
  } catch (e) {
    console.error('Error saving offline queue:', e);
  }
};

export const addToOfflineQueue = (action) => {
  const queue = getOfflineQueue();
  const newItem = {
    id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString(),
    ...action
  };
  queue.push(newItem);
  saveOfflineQueue(queue);
  return newItem;
};

export const removeOfflineQueueItem = (id) => {
  const queue = getOfflineQueue();
  const updated = queue.filter(item => item.id !== id);
  saveOfflineQueue(updated);
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
  window.dispatchEvent(new Event('offline-queue-updated'));
};

// Cached trips for offline viewing
export const cacheDriverTrips = (trips) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Error caching driver trips:', e);
  }
};

export const getCachedDriverTrips = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Process and sync pending queue to server
export const syncOfflineData = async (token) => {
  const queue = getOfflineQueue();
  if (!queue || queue.length === 0) return { success: true, count: 0 };

  let syncedCount = 0;
  const remaining = [];

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  for (const item of queue) {
    try {
      if (item.type === 'STATUS_UPDATE') {
        // Update Trip Status
        const res = await fetch(`/api/v1/fleet/trips/${item.tripId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(item.payload)
        });
        if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
        syncedCount++;
      } else if (item.type === 'EXPENSE') {
        // Add Trip Expense
        const res = await fetch('/api/v1/finance/expenses', {
          method: 'POST',
          headers,
          body: JSON.stringify(item.payload)
        });
        if (!res.ok) throw new Error(`Expense sync failed: ${res.status}`);
        syncedCount++;
      } else if (item.type === 'POD_UPLOAD') {
        // Convert Base64 dataURL back to File/Blob
        const formData = new FormData();
        const base64Data = item.payload.base64;
        const resBlob = await fetch(base64Data);
        const blob = await resBlob.blob();
        formData.append('file', blob, item.payload.fileName || 'pod_offline.jpg');

        const uploadHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`/api/trips/${item.tripId}/pod`, {
          method: 'POST',
          headers: uploadHeaders,
          body: formData
        });
        if (!res.ok) throw new Error(`POD upload failed: ${res.status}`);
        syncedCount++;
      }
    } catch (err) {
      console.warn('Could not sync item yet (retrying later):', item, err);
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);
  return { success: true, syncedCount, remainingCount: remaining.length };
};
