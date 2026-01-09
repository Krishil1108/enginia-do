import { useEffect, useState } from 'react';

const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      console.log('🔍 Setting up update checker...');
      
      // Only reload when a NEW service worker is actually installed and waiting
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 New service worker took control');
        // Only reload if we explicitly detected an update
        if (window.swUpdateDetected) {
          console.log('✅ Confirmed update - reloading');
          window.location.reload(true);
        }
      });

      // Check for updates periodically - every 60 seconds (not aggressive)
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update().catch(() => {
              // Silently fail - don't spam errors
            });
            
            // Check if there's a waiting SW (new version installed but not activated)
            if (registration.waiting) {
              console.log('🆕 New service worker detected and waiting');
              window.swUpdateDetected = true;
              setUpdateAvailable(true);
              // Tell the waiting SW to activate
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      };

      // Initial check after 5 seconds (give page time to load)
      setTimeout(checkForUpdates, 5000);

      // Check for updates every 60 seconds (much less aggressive)
      const intervalId = setInterval(checkForUpdates, 60000);

      // Cleanup
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  // Show update indicator when update is available (but don't auto-reload)
  if (updateAvailable) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50 animate-pulse">
        🔄 Update detected - page will reload shortly...
      </div>
    );
  }

  return null;
};

export default UpdateChecker;
