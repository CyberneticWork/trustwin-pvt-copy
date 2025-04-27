// components/client/search-client.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useRouter } from 'next/navigation'

export function SearchClient({ clients, onAddNewClick }) {
  const [filterText, setFilterText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClient, setMenuClient] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const router = useRouter()

  // Filter clients based on search text
  const filteredClients = clients.filter(client => {
    if (!filterText) return true;
    const searchTerm = filterText.toLowerCase();
    // Support both legacy and new API fields
    const name = client.name || client.fullname || "";
    const idNo = client.idNo || client.nic || "";
    return (
      name.toLowerCase().includes(searchTerm) ||
      idNo.toLowerCase().includes(searchTerm) ||
      (client.id && client.id.toString().toLowerCase().includes(searchTerm)) ||
      (client.location && client.location.toLowerCase().includes(searchTerm)) ||
      (client.district && client.district.toLowerCase().includes(searchTerm))
    );
  });

  // Handle outside click to close menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setMenuClient(null);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleMenuOpen = (e, client) => {
    e.preventDefault();
    setMenuOpen(true);
    setMenuClient(client);
    // Position menu at mouse click
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleUpdate = (client) => {
    setMenuOpen(false);
    setMenuClient(null);
    console.log("Update client:", client.idNo);
    
    router.push(`/clients/update/${client.nic}`);
    console.log("Update client:", client);
  };

  const handleLoans = (client) => {
    setMenuOpen(false);
    setMenuClient(null);
    console.log("Loans list for client:", client);
  };

  const handleCreateLoan = (client) => {
    setMenuOpen(false);
    setMenuClient(null);
    console.log("Create loan for client:", client);
  };

  return (
    <>
      {/* Filter */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Filter clients by name, ID, location..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Client List
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client ID
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIC
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 group cursor-pointer" onClick={(e) => handleMenuOpen(e, client)}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {client.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {/* Show name or fullname */}
                      {client.name || client.fullname}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {/* Show idNo or nic */}
                      {client.idNo || client.nic}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {/* Show gender as string if numeric */}
                      {typeof client.gender === 'number' ? (client.gender === 1 ? 'Male' : client.gender === 2 ? 'Female' : client.gender) : client.gender}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {client.address}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {client.district}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={client.activeLoans > 0 ? "default" : "outline"} className={client.activeLoans > 0 ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
                        {client.activeLoans > 0 ? `${client.activeLoans} Active Loans` : "No Loans"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500">
                    No clients found matching "{filterText}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating context menu */}
      {menuOpen && menuClient && (
        <div
          ref={menuRef}
          className="fixed z-40 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in"
          style={{ top: menuPosition.y + 4, left: menuPosition.x + 4 }}
        >
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => handleUpdate(menuClient)}>Update</button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => handleLoans(menuClient)}>Loans List</button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => handleCreateLoan(menuClient)}>Create Loan</button>
          </div>
        </div>
      )}
    </>
  );
}
