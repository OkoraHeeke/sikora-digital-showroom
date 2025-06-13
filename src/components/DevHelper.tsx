import React, { useState, useEffect } from 'react';

interface DevHelperProps {
  show?: boolean;
}

const DevHelper: React.FC<DevHelperProps> = ({ show = true }) => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastClearTime, setLastClearTime] = useState<string>('');

  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }

  const buildTime = new Date().toLocaleString('de-DE');
  const cacheId = Date.now();

  useEffect(() => {
    // Aggressive cache clearing function
    const clearAllCaches = async () => {
      try {
        console.log('🧹 Starting aggressive cache clearing...');
        
        // 1. Clear Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            console.log('🗑️ Unregistering SW:', registration);
            await registration.unregister();
          }
        }
        
        // 2. Clear all browser caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            console.log('🗑️ Deleting cache:', cacheName);
            await caches.delete(cacheName);
          }
        }
        
        // 3. Clear storage
        localStorage.clear();
        sessionStorage.clear();
        
        // 4. Clear IndexedDB
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases();
            databases.forEach(db => {
              if (db.name) {
                const deleteReq = indexedDB.deleteDatabase(db.name);
                deleteReq.onsuccess = () => console.log('🗑️ Deleted IndexedDB:', db.name);
              }
            });
          } catch (e) {
            console.log('IndexedDB clearing failed:', e);
          }
        }
        
        setLastClearTime(new Date().toLocaleTimeString('de-DE'));
        console.log('✅ Cache clearing completed');
        
      } catch (error) {
        console.error('❌ Cache clearing failed:', error);
      }
    };

    // Add aggressive cache-busting meta tags
    const addMetaTags = () => {
      const tags = [
        { key: 'cache-control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
        { key: 'pragma', value: 'no-cache' },
        { key: 'expires', value: '0' },
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' }
      ];

      tags.forEach(({ key, value }) => {
        let meta = document.querySelector(`meta[http-equiv="${key}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('http-equiv', key);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', value);
      });
    };

    // Execute cache clearing immediately
    clearAllCaches();
    addMetaTags();

    // Add timestamp to window for debugging
    (window as any).__SIKORA_BUILD_TIME__ = buildTime;
    (window as any).__SIKORA_CACHE_ID__ = cacheId;

    console.log('🔄 SIKORA ULTRA Dev Mode - Aggressive Cache Busting Active');
    console.log('⏰ Build Time:', buildTime);
    console.log('🆔 Cache ID:', cacheId);

    // Set up periodic cache clearing
    const interval = setInterval(() => {
      clearAllCaches();
      setRefreshCount(prev => prev + 1);
    }, 15000); // Every 15 seconds

    return () => {
      clearInterval(interval);
    };
  }, [buildTime, cacheId]);

  const handleForceRefresh = () => {
    console.log('🔄 Manual ultra refresh triggered');
    // Clear everything and hard reload
    localStorage.clear();
    sessionStorage.clear();
    // Force reload with new timestamp
    window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
  };

  return (
    <div 
      className="fixed bottom-2 right-2 bg-red-600 bg-opacity-90 text-white text-xs px-3 py-2 rounded-lg z-50 font-mono border border-red-300 cursor-pointer hover:bg-red-700 transition-colors"
      onClick={handleForceRefresh}
      title="Klicken für Ultra-Hard-Refresh (löscht ALLE Caches)"
    >
      <div className="flex items-center gap-1">
        <span>🔄</span>
        <span className="font-bold">ULTRA DEV</span>
      </div>
      <div>⏰ {new Date().toLocaleTimeString('de-DE')}</div>
      <div>🆔 {cacheId.toString().slice(-6)}</div>
      <div>🧹 Clears: {refreshCount}</div>
      {lastClearTime && <div>🕐 Last: {lastClearTime}</div>}
      <div className="text-xs opacity-75 mt-1">Click = Hard Refresh</div>
    </div>
  );
};

export default DevHelper; 