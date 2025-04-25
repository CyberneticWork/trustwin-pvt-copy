// app/clients/page.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AddClient } from "@/components/client/add-client";
import { SearchClient } from "@/components/client/search-client";

export default function ClientPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Sample client data
  const clients = [
    {
      id: "C-1234",
      name: "Kaduruwanage Lasantha",
      idNo: "197631001622",
      gender: "Male",
      location: "JE",
      district: "Gampaha",
      activeLoans: 1,
    },
    {
      id: "C-1235",
      name: "Sujani Fernando",
      idNo: "198242005789",
      gender: "Female",
      location: "JE",
      district: "Gampaha",
      activeLoans: 0,
    },
    {
      id: "C-1236",
      name: "Mahesh Perera",
      idNo: "199010234567",
      gender: "Male",
      location: "NG", 
      district: "Colombo",
      activeLoans: 2,
    },
    {
      id: "C-1237",
      name: "Dilani Gunathilaka",
      idNo: "198756321098",
      gender: "Female",
      location: "NG",
      district: "Colombo",
      activeLoans: 1,
    },
    {
      id: "C-1238",
      name: "Manoj Samarawickrama",
      idNo: "197845632109",
      gender: "Male",
      location: "JE",
      district: "Gampaha",
      activeLoans: 3,
    },
  ];

  const handleSubmit = (formData) => {
    // Logic to save the client data
    console.log("Client data:", formData);
    alert("Client created successfully!");
    setShowCreateForm(false);
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
          <SearchClient 
            clients={clients} 
            onAddNewClick={() => setShowCreateForm(true)} 
          />
        ) : (
          <AddClient 
            onSubmit={handleSubmit}
            onCancel={() => setShowCreateForm(false)} 
          />
        )}
      </main>
    </div>
  );
}
