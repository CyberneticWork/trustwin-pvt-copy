"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  UserPlus,
  UserCog,
  ShieldUser,
  BriefcaseBusiness 
} from "lucide-react";

const icons = {
  Home,
  CreditCard,
  Users,
  PieChart,
  Settings,
  User,
  Bell,
  Search,
  ShieldUser,
  UserCog,
  UserPen,
  UserPlus,
  BriefcaseBusiness
};

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ACL from "@/lib/jsons/ACL.json";

// Function to determine active nav based on current path
const getActiveNavFromPath = (path) => {
  // Check if path matches any route in ACL
  const aclItem = ACL.find(item => path === item.route || path.startsWith(item.route));
  return aclItem ? aclItem.route : null;
};

// Function to get ACL ID from route
const getACLIdFromRoute = (route) => {
  const aclItem = ACL.find(item => item.route === route);
  return aclItem ? aclItem.id : null;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [activeNav, setActiveNav] = useState(getActiveNavFromPath(pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredACL, setFilteredACL] = useState(ACL);
  const [expandedSubmenus, setExpandedSubmenus] = useState(new Set());
  
  // Fetch user permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Get the ACL permissions from the database
        const aclResponse = await fetch('/api/admin/acl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminId: user.id })
        });

        if (!aclResponse.ok) {
          throw new Error('Failed to fetch ACL permissions');
        }

        const aclData = await aclResponse.json();
        console.log("ACL response:", aclData);

        if (aclData.code === 'SUCCESS') {
          const permissions = aclData.data.permissions;
          console.log("Permissions:", permissions);

          // Filter ACL based on permissions
          const filteredACL = ACL.filter(item => {
            // Always show dashboard
            if (item.route === "/") return true;
            
            // If item has submenu, check if any submenu items are allowed
            if (item.submenu) {
              return item.submenu.some(subitem => permissions.includes(subitem.id));
            }
            
            // Show item if it's in the permissions array
            return permissions.includes(item.id);
          }).map(item => {
            // If item has submenu, filter the submenu items
            if (item.submenu) {
              return {
                ...item,
                submenu: item.submenu.filter(subitem => permissions.includes(subitem.id))
              };
            }
            return item;
          });
          console.log("Filtered ACL:", filteredACL);

          // Update the ACL array with only allowed routes
          setFilteredACL(filteredACL);
        } else {
          throw new Error(aclData.message || 'Failed to fetch ACL permissions');
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Set default ACL if there's an error
        setFilteredACL(ACL);
      }
    };

    fetchPermissions();
  }, [user.id]);

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
  
  // Check if current URL is accessible
  useEffect(() => {
    try {
      const currentRoute = pathname;
      if (!currentRoute) return;
      
      // Allow public routes
      const publicRoutes = ['/', '/login', '/register', '/reset-password'];
      if (publicRoutes.includes(currentRoute)) {
        return;
      }

      // Check if route exists in ACL
      const aclItem = ACL.find(item => item.route === currentRoute);
      if (!aclItem) return;
      
    } catch (error) {
      console.error('Error checking URL permission:', error);
    }
  }, [pathname]);

  // Handle navigation
  const handleNavigation = (route) => {
    console.log("Navigating to:", route);
  
    setActiveNav(route);
    router.push(route);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  // Generate random gradient for user avatar if no profile picture
  const getAvatarGradient = () => {
    const gradients = [
      'from-violet-500 to-fuchsia-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-rose-400 to-red-500',
      'from-amber-500 to-orange-500'
    ];
    
    // Use user ID or email to determine consistent gradient
    const userIdentifier = user.id || user.email || '0';
    const index = parseInt(userIdentifier.toString().slice(-1)) % gradients.length;
    return gradients[index];
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg z-30 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="p-2 rounded-full mobile-toggle text-white hover:bg-white/20"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="ml-3">
            <img src="/images/logo.png" alt="Logo" className="h-8" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                 onClick={() => handleNavigation("search")}>
            <Search className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                   onClick={() => handleNavigation("notifications")}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
          <Button variant="ghost" className="p-1 rounded-full flex items-center justify-center hover:bg-white/20"
                 onClick={() => handleNavigation("profile")}>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white font-medium`}>
              {getUserInitials()}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
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
            className={`sidebar fixed lg:static ${collapsed ? 'w-20' : 'w-20 sm:w-24 md:w-72'} bg-white dark:bg-gray-900 shadow-2xl z-30 flex flex-col
                       transition-all duration-300 ease-in-out pt-6 lg:pt-0 mt-16 lg:mt-0 rounded-r-xl lg:rounded-none`}
          >
            {/* Desktop Logo Area - Hidden on Mobile */}
            <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
                <div className="rounded-xl">
                  <img src="/images/logo.png" alt="Logo" className={collapsed ? "h-10 w-10" : "h-10"} />
                </div>
                {!collapsed && <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard</span>}
              </div>
              
              {!collapsed && (
                <Button 
                  variant="ghost" 
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={toggleCollapse}
                >
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </Button>
              )}
            </div>
            
            {/* Collapse button when sidebar is collapsed */}
            {collapsed && (
              <div className="hidden lg:flex justify-center mt-4 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={toggleCollapse}
                >
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400 rotate-180" />
                </Button>
              </div>
            )}
            
            {/* User Profile - Mobile Only */}
            <div className="lg:hidden flex flex-col items-center py-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white text-xl font-medium shadow-lg`}>
                {getUserInitials()}
              </div>
              <p className="mt-3 font-medium dark:text-white">{user.name || 'User Name'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'user@example.com'}</p>
              <div className="mt-3 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300">
                Admin
              </div>
            </div>
            
            {/* Scrollable content wrapper */}
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent min-h-0">
              <div className="px-3">
                {!collapsed && (
                  <p className="px-4 text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider mb-4">Main Menu</p>
                )}

                {/* Render ACL routes dynamically */}
                {filteredACL.map((item) => {
                  const route = item.route;
                  const Icon = icons[item.icon];
                  
                  return (
                    <div key={route} className="mb-2">
                      <NavItem 
                        icon={<Icon className="w-5 h-5" />}
                        label={item.name} 
                        isActive={activeNav === route || pathname.startsWith(route)}
                        onClick={() => {
                          if (item.submenu) {
                            // Toggle submenu
                            setExpandedSubmenus(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(route)) {
                                newSet.delete(route);
                              } else {
                                newSet.add(route);
                              }
                              return newSet;
                            });
                          } else {
                            handleNavigation(route);
                          }
                        }}
                        collapsed={collapsed}
                        hasSubmenu={!!item.submenu}
                        isExpanded={expandedSubmenus.has(route)}
                      />
                      
                      {item.submenu && expandedSubmenus.has(route) && !collapsed && (
                        <div className="ml-6 pl-5 mt-1 mb-3 border-l-2 border-purple-200 dark:border-purple-900/40 flex flex-col gap-1">
                          {item.submenu.map((subitem) => {
                            const Icon = icons[subitem.icon];
                            
                            return (
                              <NavItem 
                                key={subitem.route}
                                icon={<Icon className="w-4 h-4" />}
                                label={subitem.name}
                                isActive={activeNav === subitem.route}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleNavigation(subitem.route);
                                }}
                                collapsed={collapsed}
                                isSubmenu={true}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Settings Section */}
                {!collapsed && (
                  <p className="px-4 text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider mt-8 mb-4">Settings</p>
                )}

                {collapsed && <div className="mt-6"></div>}

                {/* Always show Settings */}
                <NavItem 
                  icon={<Settings className="w-5 h-5" />} 
                  label="Settings" 
                  isActive={activeNav === "settings"}
                  onClick={() => handleNavigation("settings")}
                  collapsed={collapsed}
                />
              </div>
            </div>
            
            {/* User profile summary at bottom - Desktop Only */}
            {!collapsed && (
              <div className="hidden lg:flex items-center px-4 py-3 border-t border-b border-gray-100 dark:border-gray-800">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white font-medium shadow-md`}>
                  {getUserInitials()}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{user.name || 'User Name'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || 'user@example.com'}</p>
                </div>
              </div>
            )}
            
            {/* Logout Button - Fixed at bottom */}
            <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <Button 
                variant="ghost" 
                className={`w-full rounded-lg h-11 px-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 text-red-500 transition-all group`}
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
      
      {/* Toggle button for collapsed sidebar on desktop */}
      {!sidebarOpen && (
        <div className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-20">
          <Button 
            variant="default"
            size="sm" 
            className="rounded-r-lg rounded-l-none h-12 w-6 bg-gradient-to-b from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      )}
    </>
  );
}

// Enhanced NavItem component with animations and badges
function NavItem({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  collapsed, 
  badge, 
  badgeColor = "blue",
  hasSubmenu = false,
  isExpanded = false,
  isSubmenu = false
}) {
  const badgeColorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
  };
  
  const activeGradient = isSubmenu 
    ? "bg-gradient-to-r from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/10 dark:to-purple-900/10 text-fuchsia-600 dark:text-fuchsia-300"
    : "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 text-indigo-600 dark:text-indigo-300";
    
  return (
    <Button 
      variant="ghost" 
      className={`w-full ${isSubmenu ? 'rounded-md h-9 text-sm' : 'rounded-lg h-11'} px-3 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center mb-1 transition-all
      ${isActive 
        ? activeGradient
        : "hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 text-gray-700 dark:text-gray-300"
      } group relative`}
      onClick={onClick}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
        <div className={`${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
          {icon}
        </div>
        {!collapsed && <span className={`hidden md:block ml-3 font-medium ${isSubmenu ? 'text-sm' : ''}`}>{label}</span>}
      </div>
      
      {!collapsed && (
        <div className="flex items-center">
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${badgeColorClasses[badgeColor]} font-semibold`}>
              {badge}
            </span>
          )}
          {hasSubmenu && (
            <ChevronRight className={`w-4 h-4 transition-all ${
              isExpanded 
                ? "rotate-90 text-purple-500 dark:text-purple-400" 
                : "rotate-0 text-gray-400 dark:text-gray-500"
            }`} />
          )}
        </div>
      )}
      
      {/* Active indicator */}
      {isActive && (
        <motion.div 
          layoutId="activeIndicator"
          className={`absolute ${isSubmenu ? 'left-0 top-1 h-7 w-1' : 'left-0 top-2 h-7 w-1'} bg-gradient-to-b from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-r-full`}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      {/* Show badge as a dot when collapsed */}
      {collapsed && badge && (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          badgeColor === "blue" ? "bg-blue-500" :
          badgeColor === "green" ? "bg-green-500" : 
          badgeColor === "purple" ? "bg-purple-500" :
          badgeColor === "orange" ? "bg-orange-500" : "bg-red-500"
        }`}></div>
      )}
    </Button>
  );
}