'use client'
import { useState } from "react";
import { useParams } from 'next/navigation';
import { UpdateClient } from "@/components/client/update-client";

const handleSubmit = (formData) => {
  // Logic to save the client data
  console.log("Client data:", formData);
  alert("Client updated successfully!");
};

export default function UpdateClientPage() {
  const params = useParams();
  // Optionally fetch customerData here if needed
  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Update Client Details</h1>
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Client NIC: {params.id}</span>
      </div>
      <UpdateClient
        // Pass customerData if you fetch it from API
        onSubmit={handleSubmit}
        onCancel={() => {}}
        initialNIC={params.id} 
      />
    </div>
  );
}