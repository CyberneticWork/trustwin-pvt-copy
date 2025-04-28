"use client";

import { AddClient } from "@/components/client/add-client";
import { useRouter } from "next/navigation";

export default function AddClientPage() {
  const router = useRouter();

  const handleSubmit = (formData) => {
    // Logic to save the client data
    console.log("Client data:", formData);
    alert("Client created successfully!");
    router.push("/clients");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-10">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Create New Client</h1>
          <p className="mb-6 text-gray-500">Enter client information below.</p>
          <AddClient onSubmit={handleSubmit} onCancel={() => router.push("/clients")} initialNIC={null} />
        </div>
      </main>
    </div>
  );
}
