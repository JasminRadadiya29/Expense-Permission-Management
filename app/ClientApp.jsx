'use client';

import { useEffect, useState } from 'react';

export default function ClientApp() {
  const [AppComponent, setAppComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    import('../src/App.jsx').then((module) => {
      if (isMounted) {
        setAppComponent(() => module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!AppComponent) {
    return null;
  }

  return <AppComponent />;
}
