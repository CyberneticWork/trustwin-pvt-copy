
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AddClient } from "@/components/client/add-client";
import { SearchClient } from "@/components/client/search-client";

export default function ClientPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const res = await fetch("/api/customer/list");
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (e) {
        setClients([]);
      }
      setLoading(false);
    }
    fetchClients();
  }, []);

  const handleSubmit = (formData) => {
    // Logic to save the client data
    console.log("Client data:", formData);
    alert("Client created successfully!");
    // setShowCreateForm(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {showCreateForm ? "Create New Client" : "Clients"}
            </h1>
            <p className="text-sm text-gray-500">
              {showCreateForm ? "Enter client information" : "Manage your client database"}
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {showCreateForm ? (
              <>
                <X className="mr-1 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Add New Client
              </>
            )}
          </Button>
        </div>

        {!showCreateForm ? (
          loading ? (
            <div className="text-center py-10 text-gray-500">Loading clients...</div>
          ) : (
            <SearchClient 
              clients={clients} 
              onAddNewClick={() => setShowCreateForm(true)} 
            />
          )
        ) : (
          <AddClient 
            onSubmit={handleSubmit}
            onCancel={() => setShowCreateForm(false)} 
            initialNIC={null}
          />
        )}
      </main>
    </div>
  );
}
