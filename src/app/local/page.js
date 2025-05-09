// pages/scroll-test.js
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ScrollTest() {
  const [storageItems, setStorageItems] = useState([]);

  useEffect(() => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        items.push([key, value]);
      }
    }
    setStorageItems(items);
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-50 overflow-y-scroll space-y-2">
      <Card>
        <CardContent className="p-4 text-sm text-gray-800">
          <h1 className="text-lg font-bold mb-2">Scroll Test - Local Storage Items</h1>
          <ul className="space-y-1">
            {storageItems.map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
