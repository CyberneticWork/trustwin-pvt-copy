"use client";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Search, Shield, Trash2, Plus, X, Home, ShieldUser, 
  UserPlus, UserPen, UserCog, CreditCard, Users, 
  Settings, PieChart, Menu, ChevronDown
} from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            role: emp.roll || "N/A",
            ACL: emp.ACL || ""  // include ACL base64 string
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

  // Track window size for responsive designs
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
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

    // Decode base64 ACL string and parse IDs
    if (admin.ACL) {
      try {
        const decoded = atob(admin.ACL); // decode base64 string
        const aclIds = decoded.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

        // Create a set of all IDs in the ACL string
        const aclIdSet = new Set(aclIds);

        // Map IDs to ACLData entries, including only explicitly mentioned submenus
        const aclEntries = aclIds.map(id => {
          const entry = ACLData.find(page => page.id === id);
          if (entry) {
            // Only include submenus that are explicitly mentioned in the ACL string
            const validSubmenu = entry.submenu?.filter(sub => 
              aclIdSet.has(sub.id)
            );
            return {
              ...entry,
              submenu: validSubmenu || undefined
            };
          }
          return null;
        }).filter(entry => entry);

        setAclTable(aclEntries);
      } catch (error) {
        console.error("Failed to decode ACL base64 string:", error);
        setAclTable([]);
      }
    } else {
      setAclTable([]);
    }
  };

  const handleAddAccess = () => {
    if (selectedPage === "all") {
      // Add all pages and their submenus to the ACL table
      const allPages = ACLData.map(page => ({
        ...page,
        submenu: page.submenu || []
      }));
      
      // Flatten the array to include both main pages and submenus
      const allItems = allPages.flatMap(page => [
        page,
        ...(page.submenu || [])
      ]);
      
      // Filter out duplicates and items already in aclTable
      const newItems = allItems.filter(item => 
        !aclTable.some(existing => existing.route === item.route)
      );
      
      setAclTable([...aclTable, ...newItems]);
    } else if (selectedPage && !aclTable.some((item) => item.route === selectedPage)) {
      const selectedPageData = ACLData.find((page) => page.route === selectedPage);
      if (selectedPageData) {
        // Add both the main page and its submenus
        const itemsToAdd = [
          selectedPageData,
          ...(selectedPageData.submenu || [])
        ].filter(item => 
          !aclTable.some(existing => existing.route === item.route)
        );
        
        setAclTable([...aclTable, ...itemsToAdd]);
      }
    }
    // Reset selected page after adding
    setSelectedPage("");
    // Close dropdown on mobile after selecting
    setIsDropdownOpen(false);
  };

  const handleDeleteAccess = (route) => {
    // If this is a main page, remove all its submenus as well
    const mainPage = aclTable.find(item => item.route === route);
    if (mainPage && mainPage.submenu) {
      const newTable = aclTable.filter(item => item.route !== route);
      mainPage.submenu.forEach(sub => {
        newTable.forEach((item, index) => {
          if (item.submenu) {
            newTable[index] = {
              ...item,
              submenu: item.submenu.filter(subItem => subItem.route !== sub.route)
            };
          }
        });
      });
      setAclTable(newTable);
    } else {
      // If this is a submenu item, only remove it from its parent
      setAclTable(aclTable.map(item => {
        if (item.submenu) {
          return {
            ...item,
            submenu: item.submenu.filter(sub => sub.route !== route)
          };
        }
        return item;
      }));
    }
  };

  const handleSaveACL = async () => {
    // Create a map of all routes to their IDs
    const routeToIdMap = new Map();
    console.log("Selected ACL Data:", JSON.stringify(aclTable));
    
    // First add all main page routes and IDs
    ACLData.forEach(page => {
      routeToIdMap.set(page.route, page.id);
      // Add submenu routes and IDs
      if (page.submenu) {
        page.submenu.forEach(sub => {
          routeToIdMap.set(sub.route, sub.id);
        });
      }
    });

    // Get all selected routes and their submenu routes
    const allSelectedRoutes = aclTable.flatMap(item => {
      const routes = [item.route];
      if (item.submenu) {
        routes.push(...item.submenu.map(sub => sub.route));
      }
      return routes;
    });
    console.log("All Selected Routes (including submenus):", JSON.stringify(allSelectedRoutes));

    // Get all IDs for selected routes
    const selectedIds = allSelectedRoutes.map(route => 
      routeToIdMap.get(route)
    ).filter(id => id !== undefined);

    // Get all parent IDs for selected routes
    const parentIds = new Set();
    allSelectedRoutes.forEach(route => {
      const parentPage = ACLData.find(page => 
        page.submenu?.some(sub => sub.route === route)
      );
      if (parentPage) {
        parentIds.add(parentPage.id);
      }
    });

    // Combine parent IDs and selected IDs
    const allIds = [...parentIds, ...selectedIds];

    // Remove duplicates and sort
    const uniqueSortedIds = Array.from(new Set(allIds)).sort((a, b) => a - b);

    // Join IDs with commas
    const joinedIds = uniqueSortedIds.join(',');

    // Base64 encode the joined string
    const base64Encoded = btoa(joinedIds);

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

    const aclJsonOutput = JSON.stringify(uniqueSortedIds, null, 2); // Format the JSON output
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

  // Icon mapping function
  const getIcon = (iconName, className = "h-5 w-5 text-gray-400") => {
    switch (iconName) {
      case 'Home': return <Home className={className} />;
      case 'ShieldUser': return <ShieldUser className={className} />;
      case 'UserPlus': return <UserPlus className={className} />;
      case 'UserPen': return <UserPen className={className} />;
      case 'UserCog': return <UserCog className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Settings': return <Settings className={className} />;
      case 'PieChart': return <PieChart className={className} />;
      default: return null;
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-start py-4 px-2 sm:py-6 sm:px-4 md:py-10">
      <Card className="w-full max-w-5xl shadow-xl border border-gray-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Access Control Managements</span>
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
          {/* Desktop and Tablet View */}
          <div className="hidden sm:block w-full overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-gray-700 text-left">ID</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-gray-700 text-left">Username</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-gray-700 text-left">Email</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-gray-700 text-left">Role</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-gray-700 text-right">Actions</th>
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
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4">{admin.id}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 font-medium">{admin.username}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4">{admin.email}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColorClass(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-right">
                      <Button
                        onClick={() => handleOpenACLDialog(admin)}
                        variant="outline"
                        size="sm"
                        className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {!isTablet ? "Manage ACL" : "ACL"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden">
            {currentPageData.map((admin, index) => (
              <div 
                key={admin.id} 
                className={`p-4 border-b border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-800">{admin.username}</h3>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColorClass(admin.role)}`}>
                    {admin.role}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">ID: {admin.id}</span>
                  <Button
                    onClick={() => handleOpenACLDialog(admin)}
                    variant="outline"
                    size="sm"
                    className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {currentPageData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-base sm:text-lg font-medium">No admins found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 sm:p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
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
        </CardFooter>
      </Card>

      {/* Improved Dialog with better responsive behavior */}
      <Dialog open={showACLDialog} onOpenChange={setShowACLDialog}>
        <DialogContent className="max-w-lg sm:max-w-xl p-0 rounded-xl bg-white shadow-xl w-[95vw] sm:w-[80%] md:w-[70%] m-0 overflow-hidden mx-auto flex flex-col max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <DialogTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              {isMobile ? (
                <div className="truncate">
                  <span className="block">Manage Access Control</span>
                  <span className="text-xs text-blue-600">{selectedAdmin?.username}</span>
                </div>
              ) : (
                <span>Manage Access Control for {selectedAdmin?.username}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 sm:p-6 flex-grow overflow-hidden flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 sm:mb-6">
              {/* Mobile Dropdown with improved positioning */}
              <div className="w-full md:flex-1">
                <div 
                  className="relative sm:hidden w-full"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="w-full border border-blue-200 rounded-lg p-2.5 pl-3 pr-8 bg-white flex items-center justify-between cursor-pointer">
                    <span className="truncate text-sm">
                      {selectedPage ? 
                        (selectedPage === "all" ? "All Pages" : 
                          ACLData.find(p => p.route === selectedPage)?.name || "Select a page") : 
                        "Select a page"}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        <div 
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setSelectedPage("all");
                            setIsDropdownOpen(false);
                          }}
                        >
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">All Pages</span>
                        </div>
                        {ACLData.map((page) => (
                          <React.Fragment key={page.id}>
                            <div 
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                              onClick={() => {
                                setSelectedPage(page.route);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <div className="flex-shrink-0">
                                {getIcon(page.icon, "h-4 w-4 text-gray-500")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{page.name}</span>
                                  {page.submenu && page.submenu.length > 0 && (
                                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{page.submenu.length}</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 truncate mt-0.5">{page.route}</div>
                              </div>
                            </div>
                            {page.submenu && page.submenu.map((subPage) => (
                              <div 
                                key={subPage.id} 
                                className="pl-8 pr-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
                                onClick={() => {
                                  setSelectedPage(subPage.route);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <div className="flex-shrink-0">
                                  {getIcon(subPage.icon, "h-3 w-3 text-gray-400")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{subPage.name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 truncate mt-0.5">{subPage.route}</div>
                                </div>
                              </div>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Desktop Select */}
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="hidden sm:block w-full border border-blue-200 rounded-lg p-2.5 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="" disabled>Select a page</option>
                  <option value="all">All Pages</option>
                  {ACLData.map((page) => (
                    <React.Fragment key={page.id}>
                      <option value={page.route} className="pl-2">
                        {page.name}
                      </option>
                    </React.Fragment>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAddAccess}
                disabled={!selectedPage}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed px-3 py-2 sm:px-4 sm:py-2 text-sm whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Access
              </Button>
            </div>
            
            <div className="border border-blue-200 rounded-xl overflow-hidden flex-grow flex flex-col">
              {/* Improved scrollable area with flex-grow */}
              <div className="flex-grow overflow-y-auto p-2">
                {aclTable.length > 0 ? (
                  aclTable.map((item, index) => (
                    <div key={index} className="border-b border-blue-100 last:border-0 bg-white hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3">
                        <div className="flex-shrink-0">
                          {getIcon(item.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="font-medium text-gray-800 truncate text-sm sm:text-base">{item.name}</span>
                            {item.submenu && item.submenu.length > 0 && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full">{item.submenu.length}</span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5 sm:mt-1">{item.route}</div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAccess(item.route)}
                            className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200 px-2 sm:px-3 py-1 text-xs sm:text-sm"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Remove</span>
                          </Button>
                        </div>
                      </div>
                      {item.submenu && item.submenu.length > 0 && (
                        <div className="pl-6 sm:pl-10 border-l border-blue-100 space-y-1 ml-2">
                          {item.submenu.map((subItem, subIndex) => (
                            <div key={subIndex} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-blue-50 mr-2 rounded-r-lg">
                              <div className="flex-shrink-0">
                                {getIcon(subItem.icon, "h-4 w-4 text-gray-400")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="font-medium text-gray-700 truncate text-xs sm:text-sm">{subItem.name}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate mt-0.5">{subItem.route}</div>
                              </div>
                              <div className="flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAccess(subItem.route)}
                                  className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200 px-2 sm:px-3 py-1 text-xs"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center bg-blue-50 h-full rounded-lg">
                    <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mb-3" />
                    <p className="text-blue-600 font-medium">No access rules added</p>
                    <p className="text-blue-500 text-xs sm:text-sm mt-1">Select a page and click Add Access</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-blue-100 bg-blue-50 flex-shrink-0 flex justify-end space-x-2 sm:space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowACLDialog(false)}
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveACL}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
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
