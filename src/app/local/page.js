'use client';

import { useEffect, useState } from 'react';

export default function LocalStoragePage() {
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    setLocalData(data);
    console.log('LocalStorage:', data);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">All LocalStorage Items</h1>
      <ul className="list-disc pl-6">
        {Object.entries(localData).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
