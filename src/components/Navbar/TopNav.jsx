"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Menu,
  LogOut,
  ChevronDown
} from "lucide-react";
import { LogoutUSR } from "../main/AuthContext";
import { useRouter } from "next/navigation";

export default function Topnav() {
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({
        id: userData.id,
        username: userData.username,
        role: userData.role,
        access: userData.access
      });
    }
    
    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Check if device is mobile (screen width less than 640px)
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkIfMobile();
    
    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
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
 
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <header className={`bg-transparent py-3 px-4 flex justify-between items-center z-10 ${scrolled ? 'sticky top-0' : ''}`}>
        <div className="flex items-center space-x-2">
          {/* Only show menu button on mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100/10 active:bg-gray-200/10 rounded-full"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Right side with subtle card background */}
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm shadow-sm z-0"></div>
          <div className="flex items-center space-x-4 relative z-10 px-4 py-2">
            {/* Only show notifications on desktop */}
            {!isMobile && (
              <Button
                variant="ghost"
                className="relative p-1 hover:bg-gray-100/10 active:bg-gray-200/10 rounded-full transition-colors"
                size="icon"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  3
                </span>
              </Button>
            )}

            <div ref={userDropdownRef} className="relative">
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                {/* Only show user info on desktop */}
                {!isMobile && (
                  <div className="text-right">
                    <p className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{user?.username || 'Loading...'}</p>
                    <p className="text-xs text-gray-500">Role: {user?.role || 'Loading...'}</p>
                  </div>
                )}

                <Avatar className="border-2 border-blue-400 shadow-sm transition-all group-hover:border-blue-500 group-hover:shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  <AvatarImage src={user?.avatarUrl} alt={user?.username || 'User'} />
                </Avatar>

                {/* Only show dropdown arrow on desktop */}
                {!isMobile && (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold">{user?.username || 'Loading...'}</p>
                      <p className="text-xs text-gray-500">Role: {user?.role || 'Loading...'}</p>
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

            {/* Logout Button - Only show on mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50/10 active:bg-red-100/10 rounded-full transition-colors"
                onClick={LogoutUSR}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
