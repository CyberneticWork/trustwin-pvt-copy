"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchClient } from "@/components/client/search-client";
import { useRouter } from "next/navigation";

export default function ClientPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false); // Only true during search
  const [searchFilter, setSearchFilter] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // No initial fetchClients
  // Fetch clients only when search is performed
  const handleSearch = async (filter, query) => {
    setLoading(true);
    setError("");
    let finalQuery = query.trim();
    
    // Handle customer ID format
    if (filter === "id") {
      const match = finalQuery.match(/^CLN-(\d{1,})$/i);
      if (match) {
        finalQuery = String(parseInt(match[1], 10));
      } else if (/^\d+$/.test(finalQuery)) {
        finalQuery = finalQuery;
      } else {
        setClients([]);
        setError("Customer ID must be in the format CLN-XXX or a number.");
        setLoading(false);
        return;
      }
    }
    
    // For NIC, allow partial matching
    if (filter === "nic") {
      finalQuery = finalQuery.toLowerCase();
    }

    try {
      const res = await fetch(`/api/customer/list?filter=${filter}&query=${encodeURIComponent(finalQuery)}&partial=true`);
      const data = await res.json();
      if (!res.ok) {
        setClients([]);
        setError(data.error || "Failed to load clients.");
        console.error("API error:", data);
      } else {
        setClients(Array.isArray(data) ? data : []);
        console.log("API success:", data);
      }
    } catch (e) {
      setClients([]);
      setError("Network error or server not reachable.");
      console.error("Fetch error:", e);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Clients
            </h1>
            <p className="text-sm text-gray-500">
              Manage your client database
            </p>
          </div>
          <Button 
            onClick={() => router.push("/clients/add")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Add New Client
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading clients...</div>
        ) : (
          <SearchClient 
            clients={clients} 
            onAddNewClick={() => router.push("/clients/add")}
            loading={loading}
            onSearch={handleSearch}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            error={error}
          />
        )}
      </main>
    </div>
  );
}
