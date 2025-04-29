"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Shield, Trash2, Plus, X } from "lucide-react";
import ACLData from "@/lib/jsons/ACL.json";

export default function ACL() {
  // Admin data fetched from API
  const [originalAdmins, setOriginalAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [showACLDialog, setShowACLDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPage, setSelectedPage] = useState("");
  const [aclTable, setAclTable] = useState([]);

  // Fetch admins from API on component mount
  useEffect(() => {
    async function fetchAdmins() {
      try {
        const response = await fetch('/api/employees/getadmns');
        const json = await response.json();
        if (json.code === "SUCCESS") {
          // Map API data to expected format for table
          const mappedAdmins = json.data.map(emp => ({
            id: emp.id,
            username: emp.username,
            email: emp.email,
            role: emp.roll || "N/A"
          }));
          setOriginalAdmins(mappedAdmins);
        } else {
          console.error("Failed to fetch admins:", json.message);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    }
    fetchAdmins();
  }, []);

  // Real-time filtered admins using useMemo for performance
  const filteredAdmins = useMemo(() => {
    if (!search.trim()) return originalAdmins;
    
    const searchTerms = search.toLowerCase().split(" ").filter(term => term);
    
    return originalAdmins.filter(admin => {
      const searchableText = `${admin.username} ${admin.email} ${admin.role}`.toLowerCase();
      // Check if all search terms are included in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [originalAdmins, search]);

  // Calculate max pages based on filtered data
  const maxPage = Math.max(1, Math.ceil(filteredAdmins.length / limit));

  // Reset to first page when search criteria changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleOpenACLDialog = (admin) => {
    setSelectedAdmin(admin);
    setShowACLDialog(true);
    // Load any existing ACL data for this admin (demo)
    setAclTable([]);
  };

  const handleAddAccess = () => {
    if (selectedPage === "all") {
      // Add all pages to the ACL table that aren't already there
      const allPages = ACLData.filter(
        (page) => !aclTable.some((item) => item.route === page.route)
      );
      setAclTable([...aclTable, ...allPages.map((page) => ({ name: page.name, route: page.route }))]);
    } else if (selectedPage && !aclTable.some((item) => item.route === selectedPage)) {
      const selectedPageData = ACLData.find((page) => page.route === selectedPage);
      if (selectedPageData) {
        setAclTable([...aclTable, { name: selectedPageData.name, route: selectedPage }]);
      }
    }
    // Reset selected page after adding
    setSelectedPage("");
  };

  const handleDeleteAccess = (route) => {
    setAclTable(aclTable.filter((item) => item.route !== route));
  };

  const handleSaveACL = async () => {
    // Map selected routes to their corresponding IDs from ACLData
    const aclData = aclTable.map((item) => {
      const aclEntry = ACLData.find((page) => page.route === item.route);
      return aclEntry ? aclEntry.id : null; // Return the ID if found, otherwise null
    }).filter((id) => id !== null); // Filter out any null values

    // Sort IDs in ascending order
    const sortedIds = aclData.sort((a, b) => a - b);

    // Join IDs with commas
    const joinedIds = sortedIds.join(',');

    // Base64 encode the joined string
    const base64Encoded = btoa(joinedIds);

    // Print base64 encoded string to console
    console.log("Base64 Encoded ACL IDs:", base64Encoded);

    try {
      const response = await fetch('/api/employees/update-acl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedAdmin?.id,
          aclBase64: base64Encoded
        })
      });
      const json = await response.json();
      if (json.code === "SUCCESS") {
        alert("ACL updated successfully");
      } else {
        alert("Failed to update ACL: " + json.message);
      }
    } catch (error) {
      console.error("Error updating ACL:", error);
      alert("Error updating ACL");
    }

    const aclJsonOutput = JSON.stringify(aclData, null, 2); // Format the JSON output
    console.log("Saved ACL Data for", selectedAdmin?.username, ":", aclJsonOutput);
    setShowACLDialog(false);
    setAclTable([]);
  };

  // Helper function to get role color class
  const getRoleColorClass = (role) => {
    switch (role) {
      case "Super Admin": return "bg-purple-100 text-purple-800";
      case "Editor": return "bg-blue-100 text-blue-800";
      case "Viewer": return "bg-green-100 text-green-700";
      case "Moderator": return "bg-amber-100 text-amber-800";
      case "Contributor": return "bg-sky-100 text-sky-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Current page of data to display
  const currentPageData = filteredAdmins.slice((page - 1) * limit, page * limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-start py-6 px-4 md:py-10">
      <Card className="w-full max-w-5xl shadow-xl border border-gray-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Access Control Management</span>
            </CardTitle>
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search admins..."
                className="pl-8 pr-10 py-2 w-full border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              />
              {search && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 font-medium text-gray-700 text-left">ID</th>
                  <th className="px-6 py-3 font-medium text-gray-700 text-left">Username</th>
                  <th className="px-6 py-3 font-medium text-gray-700 text-left">Email</th>
                  <th className="px-6 py-3 font-medium text-gray-700 text-left">Role</th>
                  <th className="px-6 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((admin, index) => (
                  <tr
                    key={admin.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">{admin.id}</td>
                    <td className="px-6 py-4 font-medium">{admin.username}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColorClass(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleOpenACLDialog(admin)}
                        variant="outline"
                        size="sm"
                        className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Manage ACL
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentPageData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Shield className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg font-medium">No admins found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 border-t border-gray-200 bg-white">
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredAdmins.length > 0 ? (
                <>
                  Showing {Math.min((page - 1) * limit + 1, filteredAdmins.length)} to {Math.min(page * limit, filteredAdmins.length)} of {filteredAdmins.length} entries
                  {search && <span className="ml-1">({originalAdmins.length - filteredAdmins.length} filtered out)</span>}
                </>
              ) : (
                <span>No matching records</span>
              )}
            </div>
            <Pagination
              page={page}
              maxPage={maxPage}
              onPageChange={handlePageChange}
              className="flex items-center space-x-1"
            />
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showACLDialog} onOpenChange={setShowACLDialog}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-lg bg-white">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Manage Access Control for {selectedAdmin?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select a page</option>
                  <option value="all">All Pages</option>
                  {ACLData.map((page) => (
                    <option key={page.id} value={page.route}>{page.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <Button
                onClick={handleAddAccess}
                disabled={!selectedPage}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Access
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-medium text-gray-700 text-left">Page Name</th>
                    <th className="px-4 py-3 font-medium text-gray-700 text-left">Route Path</th>
                    <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aclTable.map((item, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.route}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAccess(item.route)}
                          className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {aclTable.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white">
                  <Shield className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No access rules added</p>
                  <p className="text-gray-400 text-sm mt-1">Select a page and click Add Access</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowACLDialog(false)}
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveACL}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              disabled={aclTable.length === 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}