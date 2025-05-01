"use client";

import { useState, useEffect } from "react";
import { 
  Home, 
  CreditCard, 
  Users, 
  Settings,
  PieChart,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Search,
  UserPen,
  UserPlus ,
  UserCog,
  ShieldUser
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation"; // Import Next.js router

import { Folder, Users as UsersIcon } from "lucide-react";

// Define the pages and their corresponding routes
const PAGES = {
  "dashboard": "/",
  "loans": "/loans",
  "clients": "/clients",
  "reports": "/reports",
  "settings": "/settings",
  "profile": "/profile",
  "notifications": "/notifications",
  "search": "/search",
  "employees": "/admin",
  "adminACL": "/admin/ACL",
  "adminUser": "/admin/user",
  "adminAdd": "/admin/addnew",
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active nav based on current path
  const getActiveNavFromPath = (path) => {
    const route = Object.entries(PAGES).find(([key, value]) => value === path);
    return route ? route[0] : "dashboard";
  };
  
  const [activeNav, setActiveNav] = useState(getActiveNavFromPath(pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  // Update active nav when pathname changes
  useEffect(() => {
    setActiveNav(getActiveNavFromPath(pathname));
  }, [pathname]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarOpen && 
          !document.querySelector('.sidebar')?.contains(e.target) && 
          !document.querySelector('.mobile-toggle')?.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    // Add your logout logic here
    alert("Logging out...");
  };

  // Toggle sidebar collapse on desktop
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  // Handle navigation
  const handleNavigation = (navKey) => {
    setActiveNav(navKey);
    router.push(PAGES[navKey]);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-30 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="p-2 rounded-full mobile-toggle font-semibold"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          <div className="ml-3">
            <img src="/images/logo.png" alt="Logo" className="h-8" />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                 onClick={() => handleNavigation("search")}>
            <Search className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                 onClick={() => handleNavigation("notifications")}>
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                 onClick={() => handleNavigation("profile")}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              JD
            </div>
          </Button>
        </div>
      </div>
      
      {/* Dark Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    
      {/* Enhanced Sidebar with animations and scrollbar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`sidebar fixed lg:static ${collapsed ? 'w-20' : 'w-20 sm:w-24 md:w-72'} h-full bg-white shadow-xl z-30 flex flex-col
                       transition-all duration-300 ease-in-out pt-6 lg:pt-0 mt-16 lg:mt-0`}
          >
            {/* Desktop Logo Area - Hidden on Mobile */}
            <div className="hidden lg:flex items-center justify-between px-6 py-1 border-b border-gray-100 flex-shrink-0">
              <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
                <div className="p-2 rounded-xl">
                  <img src="/images/logo.png" alt="Logo" className={collapsed ? "h-0" : "w-40 h-40"} />
                </div>
              </div>
              
              {!collapsed && (
                <Button 
                  variant="ghost" 
                  className="p-1.5 rounded-full hover:bg-gray-100"
                  onClick={toggleCollapse}
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </Button>
              )}
            </div>
            
            {/* Collapse button when sidebar is collapsed */}
            {collapsed && (
              <div className="hidden lg:flex justify-center mt-4 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  className="p-1.5 rounded-full hover:bg-gray-100"
                  onClick={toggleCollapse}
                >
                  <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
                </Button>
              </div>
            )}
            
            {/* User Profile - Mobile Only */}
            <div className="lg:hidden flex flex-col items-center py-6 border-b border-gray-100 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-medium">
                CP 
              </div>
              <p className="mt-2 font-medium">John Doe</p>
              <p className="text-sm text-gray-500">john.doe@example.com</p>
            </div>
            
            {/* Scrollable content area */}
            <div className="flex-grow overflow-y-auto scrollbar-container">
              <div className="px-3 pt-6">
                {!collapsed && (
                  <p className="px-4 text-xs text-gray-400 uppercase font-semibold tracking-wider mb-4">Main Menu</p>
                )}
                
                {/* Navigation Items with enhanced hover effects */}
                <NavItem 
                  icon={<Home className="w-5 h-5" />} 
                  label="Dashboard" 
                  isActive={activeNav === "dashboard"}
                  onClick={() => handleNavigation("dashboard")}
                  collapsed={collapsed}
                />

                <div className="mb-2">
                  <NavItem 
                    icon={<Users className="w-5 h-5" />} 
                    label="Clients" 
                    isActive={activeNav === "clients" || pathname.startsWith("/clients")}
                    onClick={() => handleNavigation("clients")}
                    collapsed={collapsed}
                  />
                  {/* Submenu for Clients */}
                  {!collapsed && pathname.startsWith("/clients") && (
                    <div className="ml-10 mt-1 flex flex-col gap-1">
                      <button
                        className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-50 hover:text-blue-700 ${pathname === "/clients" ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-600"}`}
                        onClick={() => router.push("/clients")}
                      >
                        <Search className="w-4 h-4" />
                        Search Client
                      </button>
                      <button
                        className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg text-sm font-medium transition hover:bg-green-50 hover:text-green-700 ${pathname === "/clients/add" ? "text-green-700 font-semibold bg-green-50" : "text-gray-600"}`}
                        onClick={() => router.push("/clients/add")}
                      >
                        <Users className="w-4 h-4" />
                        Add New Client
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <NavItem 
                    icon={<ShieldUser className="w-5 h-5" />} 
                    label="Employees" 
                    isActive={activeNav === "employees" || pathname.startsWith("/admin")}
                    onClick={() => handleNavigation("employees")}
                    collapsed={collapsed}
                  />
                  {/* Submenu for Admin */}
                  {!collapsed && pathname.startsWith("/admin") && (
                    <div className="ml-10 mt-1 flex flex-col gap-1">
                        <button
                        className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg text-sm font-medium transition hover:bg-green-50 hover:text-green-700 ${pathname === "/admin/addnew" ? "text-green-700 font-semibold bg-green-50" : "text-gray-600"}`}
                        onClick={() => router.push("/admin/addnew")}
                      >
                        <UserPlus className="w-4 h-4" />
                        Add New 
                      </button>

                      <button
                        className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg text-sm font-medium transition hover:bg-green-50 hover:text-green-700 ${pathname === "/admin/user" ? "text-green-700 font-semibold bg-green-50" : "text-gray-600"}`}
                        onClick={() => router.push("/admin/user")}
                      >
                        <UserPen className="w-4 h-4" />
                        Update
                      </button>
                   

                      <button
                        className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-50 hover:text-blue-700 ${pathname === "/admin/ACL" ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-600"}`}
                        onClick={() => router.push("/admin/ACL")}
                      >
                        <UserCog  className="w-4 h-4" />
                        ACL
                      </button>
                    </div>
                  )}
                </div>

                <NavItem 
                  icon={<CreditCard className="w-5 h-5" />} 
                  label="Credits" 
                  isActive={activeNav === "loans"}
                  onClick={() => handleNavigation("loans")}
                  collapsed={collapsed}
                  badge="2"
                />
                
                <NavItem 
                  icon={<PieChart className="w-5 h-5" />} 
                  label="Reports" 
                  isActive={activeNav === "reports"}
                  onClick={() => handleNavigation("reports")}
                  collapsed={collapsed}
                  badge="New"
                  badgeColor="green"
                />
                
                {!collapsed && (
                  <p className="px-4 text-xs text-gray-400 uppercase font-semibold tracking-wider mt-8 mb-4">Settings</p>
                )}
                
                {collapsed && <div className="mt-6"></div>}
                
                <NavItem 
                  icon={<Settings className="w-5 h-5" />} 
                  label="Settings" 
                  isActive={activeNav === "settings"}
                  onClick={() => handleNavigation("settings")}
                  collapsed={collapsed}
                />
                
                <NavItem 
                  icon={<User className="w-5 h-5" />} 
                  label="Profile" 
                  isActive={activeNav === "profile"}
                  onClick={() => handleNavigation("profile")}
                  collapsed={collapsed}
                />
                
                {/* Add some extra nav items to demonstrate scrolling */}
                <NavItem 
                  icon={<Bell className="w-5 h-5" />} 
                  label="Notifications" 
                  isActive={activeNav === "notifications"}
                  onClick={() => handleNavigation("notifications")}
                  collapsed={collapsed}
                  badge="5"
                  badgeColor="red"
                />
                
                <NavItem 
                  icon={<Search className="w-5 h-5" />} 
                  label="Search" 
                  isActive={activeNav === "search"}
                  onClick={() => handleNavigation("search")}
                  collapsed={collapsed}
                />
                
                {/* More navigation items to ensure scrolling */}
                {Array(5).fill().map((_, i) => {
                  const extraKey = `extra-${i}`;
                  // Add extra routes to PAGES object dynamically
                  PAGES[extraKey] = `/extra-item-${i+1}`;
                  
                  return (
                    <NavItem 
                      key={extraKey}
                      icon={<Settings className="w-5 h-5" />} 
                      label={`Extra Item ${i+1}`} 
                      isActive={activeNav === extraKey}
                      onClick={() => handleNavigation(extraKey)}
                      collapsed={collapsed}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Logout Button - Fixed at bottom */}
            <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0">
              <Button 
                variant="ghost" 
                className={`w-full rounded-full h-12 px-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center hover:bg-red-50 active:bg-red-100 text-red-500 transition-all group`}
                onClick={handleLogout}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                  <LogOut className="w-5 h-5" />
                  {!collapsed && <span className="hidden md:block ml-3 font-semibold">Logout</span>}
                </div>
                {!collapsed && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* App Content Area - For demonstration */}
      
    </>
  );
}

// Enhanced NavItem component with animations and badges
function NavItem({ icon, label, isActive, onClick, collapsed, badge, badgeColor = "blue" }) {
  const badgeColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };
  
  return (
    <Button 
      variant="ghost" 
      className={`w-full rounded-full h-12 px-3 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center mb-2 transition-all ${
        isActive 
          ? "bg-blue-50 text-blue-600" 
          : "hover:bg-gray-100 active:bg-gray-200 text-gray-600"
      } group`}
      onClick={onClick}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
        {icon}
        {!collapsed && <span className="hidden md:block ml-3 font-semibold">{label}</span>}
      </div>
      
      {!collapsed && (
        <div className="flex items-center">
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${badgeColorClasses[badgeColor]} font-semibold`}>
              {badge}
            </span>
          )}
          <ChevronRight className={`w-4 h-4 transition-all ${
            isActive 
              ? "opacity-100" 
              : "opacity-0 group-hover:opacity-70"
          }`} />
        </div>
      )}
      
      {/* Show badge as a dot when collapsed */}
      {collapsed && badge && (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          badgeColor === "blue" ? "bg-blue-500" :
          badgeColor === "green" ? "bg-green-500" : "bg-red-500"
        }`}></div>
      )}
    </Button>
  );
}