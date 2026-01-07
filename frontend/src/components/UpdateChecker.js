import { useEffect, useState } from 'react';

const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      console.log('🔍 Setting up aggressive update checker...');
      
      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 New service worker activated - reloading page immediately');
        window.location.reload(true);
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from service worker:', event.data);
        
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('✨ New version detected:', event.data.version);
          setUpdateAvailable(true);
          
          // Force clear caches and reload
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'FORCE_UPDATE'
            });
          }
          
          // Auto-reload with cache busting
          setTimeout(() => {
            window.location.reload(true);
          }, 500);
        }
      });

      // Check for updates periodically - every 5 minutes
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update().catch(() => {});
          }
        });
      };

      // Initial check
      checkForUpdates();

      // Check for updates every 5 minutes
      const intervalId = setInterval(checkForUpdates, 300000);

      // Check for updates when page becomes visible (but silently)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkForUpdates();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup
      return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // Show update indicator when update is available
  if (updateAvailable) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50 animate-pulse">
        🔄 Updating to latest version...
      </div>
    );
  }

  return null;
};

export default UpdateChecker;
