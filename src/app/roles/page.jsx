"use client"

import { useEffect, useState } from 'react';

export default function RoleManager() {
  const [roles, setRoles] = useState({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleAddRole = () => {
    if (!newKey || !newValue) return;

    setRoles(prev => ({
      ...prev,
      [newKey]: isNaN(newValue) ? newValue : Number(newValue),
    }));

    setNewKey('');
    setNewValue('');
  };

  const handleUpdate = async () => {
    try {
      await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roles),
      });
      alert('Roles updated!');
    } catch (err) {
      console.error('Failed to update roles:', err);
    }
  };

  const handleChange = (key, value) => {
    setRoles(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedChange = (parentKey, key, value) => {
    setRoles(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [key]: value
      }
    }));
  };

  const handleDelete = (key) => {
    const updated = { ...roles };
    delete updated[key];
    setRoles(updated);
  };

  const handleNestedDelete = (parentKey, key) => {
    const updated = { ...roles };
    if (updated[parentKey]) {
      delete updated[parentKey][key];

      if (Object.keys(updated[parentKey]).length === 0) {
        delete updated[parentKey];
      }
    }
    setRoles(updated);
  };

  const renderRoles = () => {
    return Object.entries(roles).map(([key, value]) => {
      if (typeof value === 'object') {
        return (
          <div key={key} className="mt-4 p-2 border rounded bg-slate-50">
            <h3 className="font-bold mb-2">{key} (group)</h3>
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="flex gap-2 mb-2 items-center">
                <span className="w-28">{subKey}</span>
                <input
                  type="text"
                  value={subValue}
                  onChange={(e) =>
                    handleNestedChange(key, subKey, e.target.value)
                  }
                  className="border px-2 py-1 w-full"
                />
                <button
                  onClick={() => handleNestedDelete(key, subKey)}
                  className="text-red-600 font-bold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div key={key} className="flex gap-2 mt-2 items-center">
          <span className="w-28">{key}</span>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="border px-2 py-1 w-full"
          />
          <button
            onClick={() => handleDelete(key)}
            className="text-red-600 font-bold"
          >
            Delete
          </button>
        </div>
      );
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Role Manager</h1>

      {renderRoles()}

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Add New Role</h2>
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="border px-2 py-1 w-1/3"
          />
          <input
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="border px-2 py-1 w-2/3"
          />
          <button
            onClick={handleAddRole}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={handleUpdate}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
