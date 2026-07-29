'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered', reg);
        } catch (err) {
          console.error('❌ Service Worker registration failed', err);
        }
      });
    }
  }, []);

  return null;
}
// 'use client';

// import { useEffect } from 'react';

// export default function PWARegister() {
//   useEffect(() => {
//     console.log("PWARegister loaded");

//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker.register('/sw.js')
//         .then((reg) => console.log("SW OK", reg))
//         .catch((err) => console.error("SW ERROR", err));
//     }
//   }, []);

//   return null;
// }