"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Search,
  Menu,
  Filter,
  X,
  LogOut,
  ChevronDown
} from "lucide-react";
import { LogoutUSR } from "../main/AuthContext";

export default function Topnav() {
  const [user, setUser] = useState({
    name: "Chandimal Pathegama",
    email: "chandimal@email.com",
    avatarUrl: "",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchType, setSearchType] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filterRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setShowFilterDropdown(false);
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "clientId":
        return "Search by Client ID...";
      case "nic":
        return "Search by NIC...";
      case "loanId":
        return "Search by Loan ID...";
      default:
        return "Search loans, clients...";
    }
  };

 
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <header className="bg-white shadow-md py-3 px-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 hover:bg-gray-100 active:bg-gray-200 rounded-full"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden sm:block w-80">
            <div className="flex items-center">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-24 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                />
                <div className="absolute right-2 top-1.5 flex items-center">
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </Button>
                  )}
                  <div ref={filterRef} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs flex items-center px-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      {searchType === "all"
                        ? "All"
                        : searchType === "clientId"
                          ? "Client ID"
                          : searchType === "nic"
                            ? "NIC"
                            : "Loan ID"}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>

                    {/* Filter Dropdown */}
                    {showFilterDropdown && (
                      <div className="absolute mt-1 w-40 right-0 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
                        <div className="py-1">
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "all"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-100 active:bg-gray-200"
                              }`}
                            onClick={() => handleSearchTypeChange("all")}
                          >
                            All
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "clientId"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-100 active:bg-gray-200"
                              }`}
                            onClick={() => handleSearchTypeChange("clientId")}
                          >
                            Client ID
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "nic"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-100 active:bg-gray-200"
                              }`}
                            onClick={() => handleSearchTypeChange("nic")}
                          >
                            NIC
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "loanId"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-100 active:bg-gray-200"
                              }`}
                            onClick={() => handleSearchTypeChange("loanId")}
                          >
                            Loan ID
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "vehicleNo"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-100 active:bg-gray-200"
                              }`}
                            onClick={() => handleSearchTypeChange("vehicleNo")}
                          >
                            Vehicle No.
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="relative p-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
            size="icon"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              3
            </span>
          </Button>

          <div ref={userDropdownRef} className="relative">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <Avatar className="border-2 border-blue-400 shadow-sm transition-all group-hover:border-blue-500 group-hover:shadow-md">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">CP</AvatarFallback>
              </Avatar>

              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </div>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors">
                    Profile Settings
                  </button>

                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors">
                    Account Preferences
                  </button>

                  <div className="border-t border-gray-100 mt-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                      onClick={LogoutUSR}
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button for Header (Mobile View) */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-red-600 hover:bg-red-50 active:bg-red-100 rounded-full transition-colors"
            onClick={LogoutUSR}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Search bar for mobile */}
      <div className="px-4 py-3 bg-white sm:hidden shadow-md">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-12 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:shadow-md"
          />
          <div className="absolute right-2 top-1.5 flex items-center">
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs flex items-center px-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="h-3 w-3 mr-1" />
              {searchType.charAt(0).toUpperCase()}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Mobile Filter Dropdown */}
        {showFilterDropdown && (
          <div className="mt-2 w-full bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
            <div className="py-1">
              <button
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "all"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                onClick={() => handleSearchTypeChange("all")}
              >
                All
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "clientId"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                onClick={() => handleSearchTypeChange("clientId")}
              >
                Client ID
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "nic"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                onClick={() => handleSearchTypeChange("nic")}
              >
                NIC
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "loanId"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                onClick={() => handleSearchTypeChange("loanId")}
              >
                Loan ID
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${searchType === "vehicleNo"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                onClick={() => handleSearchTypeChange("vehicleNo")}
              >
                Vehicle No.
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}