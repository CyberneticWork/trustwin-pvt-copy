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
  BriefcaseBusiness,
  SendHorizontal,
  BookUser,
  ChevronLeft
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
  BriefcaseBusiness,
  SendHorizontal,
  BookUser
};

import { Button } from "@/components/ui/button";
import ACL from "@/lib/jsons/ACL.json";

// Function to determine active nav based on current path
const getActiveNavFromPath = (path) => {
  // First check for exact route match
  const exactMatch = ACL.find(item => path === item.route);
  if (exactMatch) return exactMatch.route;
  
  // Then check submenu items
  for (const item of ACL) {
    if (item.submenu) {
      const submenuMatch = item.submenu.find(subitem => path === subitem.route);
      if (submenuMatch) return submenuMatch.route;
    }
  }
  
  // Check if path starts with any route
  const startsWith = ACL.find(item => path.startsWith(item.route) && item.route !== '/');
  return startsWith ? startsWith.route : null;
};

// Function to get ACL ID from route
const getACLIdFromRoute = (route) => {
  const aclItem = ACL.find(item => item.route === route);
  return aclItem ? aclItem.id : null;
};

// Function to find parent route of a submenu item
const getParentRoute = (route) => {
  for (const item of ACL) {
    if (item.submenu) {
      const isChild = item.submenu.some(subitem => subitem.route === route);
      if (isChild) return item.route;
    }
  }
  return null;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  
  const [activeNav, setActiveNav] = useState(getActiveNavFromPath(pathname));
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

        if (aclData.code === 'SUCCESS') {
          const permissions = aclData.data.permissions;
          
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

    if (user.id) {
      fetchPermissions();
    }
  }, [user.id]);

  // Auto-expand parent menu when submenu item is active
  useEffect(() => {
    const currentRoute = getActiveNavFromPath(pathname);
    const parentRoute = getParentRoute(currentRoute);
    
    if (parentRoute) {
      setExpandedSubmenus(prev => {
        const newSet = new Set(prev);
        newSet.add(parentRoute);
        return newSet;
      });
    }
    
    setActiveNav(currentRoute);
  }, [pathname]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarOpen && 
          window.innerWidth < 1024 &&
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

  // Toggle sidebar collapse
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
    setActiveNav(route);
    router.push(route);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false); // Close sidebar on mobile after navigation
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  // Check if a submenu item is active
  const isSubmenuItemActive = (route) => {
    // Check if current active nav is in this submenu
    return activeNav === route;
  };

  // Check if any submenu item under a parent is active
  const hasActiveChild = (parentItem) => {
    if (!parentItem.submenu) return false;
    return parentItem.submenu.some(subitem => isSubmenuItemActive(subitem.route));
  };

  return (
    <>
      {/* Mobile Header Bar - Slate Theme */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-800 shadow-lg z-30 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="p-2 rounded-full mobile-toggle text-slate-300 hover:bg-white/5"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="ml-3">
            {/* Mobile logo in a white square */}
            <div className="bg-white rounded-md p-0 w-10 h-10 flex items-center justify-center overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.15)]">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="w-[140%] h-[140%] object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/5"
                 onClick={() => handleNavigation("search")}>
            <Search className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Button variant="ghost" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/5"
                   onClick={() => handleNavigation("notifications")}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
          <Button variant="ghost" className="p-1 rounded-full flex items-center justify-center hover:bg-white/5"
                 onClick={() => handleNavigation("profile")}>
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
              {getUserInitials()}
            </div>
          </Button>
        </div>
      </div>
      
      {/* Dark Overlay for Mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    
      {/* Slate Edge Design Sidebar */}
      {sidebarOpen && (
        <div 
          className={`sidebar fixed lg:static ${collapsed ? 'w-20' : 'w-20 sm:w-24 md:w-72'} bg-slate-800 shadow-lg z-30 flex flex-col
                     transition-all duration-300 ease-in-out pt-6 lg:pt-0 mt-16 lg:mt-0 h-full
                     border-r-2 border-slate-700`}
        >
          {/* Desktop Logo Area with White Square - Hidden on Mobile */}
          <div className={`hidden lg:flex items-center ${collapsed ? 'justify-center' : 'justify-center'} px-4 py-6 border-b border-slate-700 flex-shrink-0`}>
            {!collapsed && (
              <div className="bg-white rounded-md p-0 w-36 h-36 flex items-center justify-center overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1">
                <img 
                  src="/images/logo.png" 
                  alt="Logo" 
                  className="w-[140%] h-[140%] object-contain"
                />
              </div>
            )}
            {collapsed && (
              <div className="bg-white rounded-md p-0 w-14 h-14 flex items-center justify-center overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1">
                <img 
                  src="/images/logo.png" 
                  alt="Logo" 
                  className="w-[140%] h-[140%] object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Collapse/Expand button */}
          <div className="hidden lg:flex justify-center mt-4 flex-shrink-0">
            <Button 
              variant="ghost" 
              className="p-1.5 rounded-full text-slate-300 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/5"
              onClick={toggleCollapse}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {/* User Profile - Mobile Only */}
          <div className="lg:hidden flex flex-col items-center py-6 border-b border-slate-700 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-white text-xl font-medium shadow-lg">
              {getUserInitials()}
            </div>
            <div className="mt-3 px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-slate-300">
              Admin
            </div>
          </div>
          
          {/* Scrollable content wrapper */}
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent min-h-0">
            <div className="px-3">
              {!collapsed && (
                <p className="px-4 text-xs text-slate-400 uppercase font-semibold tracking-wider mb-4 mt-4">Main Menu</p>
              )}

              {/* Render ACL routes dynamically */}
              {filteredACL.map((item) => {
                const route = item.route;
                const Icon = icons[item.icon];
                const isParentActive = activeNav === route;
                const hasActiveSubmenuChild = hasActiveChild(item);
                
                return (
                  <div key={route} className="mb-2">
                    <NavItem 
                      icon={<Icon className="w-5 h-5" />}
                      label={item.name} 
                      isActive={isParentActive || hasActiveSubmenuChild}
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
                      <div className="ml-6 pl-5 mt-1 mb-3 border-l-2 border-slate-700 flex flex-col gap-1">
                        {item.submenu.map((subitem) => {
                          const Icon = icons[subitem.icon];
                          const isSubItemActive = isSubmenuItemActive(subitem.route);
                          
                          return (
                            <NavItem 
                              key={subitem.route}
                              icon={<Icon className="w-4 h-4" />}
                              label={subitem.name}
                              isActive={isSubItemActive}
                              onClick={() => handleNavigation(subitem.route)}
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
                <p className="px-4 text-xs text-slate-400 uppercase font-semibold tracking-wider mt-8 mb-4">Settings</p>
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
          
          {/* Logout Button - Fixed at bottom */}
          <div className="px-3 py-4 border-t border-slate-700 flex-shrink-0">
            <Button 
              variant="ghost" 
              className={`w-full h-11 px-4 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center text-red-300 transition-transform group hover:-translate-y-1 duration-300 hover:bg-white/5`}
              onClick={handleLogout}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                <LogOut className="w-5 h-5" />
                {!collapsed && <span className="hidden md:block ml-3 font-semibold">Logout</span>}
              </div>
              {!collapsed && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Button>
          </div>
        </div>
      )}
      
      {/* Toggle button when sidebar is closed */}
      {!sidebarOpen && (
        <div className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-20">
          <Button 
            variant="default"
            size="sm" 
            className="h-12 w-6 bg-slate-600 shadow-lg hover:-translate-x-1 transition-transform duration-300 hover:bg-slate-600"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      )}
    </>
  );
}

// NavItem component - Slate theme with light blue accents and hover animation
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
    amber: "bg-amber-900/30 text-amber-300",
    blue: "bg-blue-900/30 text-blue-300",
    emerald: "bg-emerald-900/30 text-emerald-300",
    purple: "bg-purple-900/30 text-purple-300",
    indigo: "bg-indigo-900/30 text-indigo-300",
  };
  
  // Updated to keep text light on hover
  const activeStyle = isActive 
    ? "bg-blue-800/10 text-blue-300 font-medium"
    : "hover:bg-white/5 text-slate-300 hover:text-slate-200";
    
  return (
    <Button 
      variant="ghost" 
      className={`w-full ${isSubmenu ? 'h-9 text-sm' : 'h-11'} px-3 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center mb-1 
      ${activeStyle} group hover:-translate-y-0.5 transition-transform duration-300 ease-in-out`}
      onClick={onClick}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
        <div className={`${isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {icon}
        </div>
        {!collapsed && <span className={`hidden md:block ml-3 ${isSubmenu ? 'text-sm' : ''}`}>{label}</span>}
      </div>
      
      {!collapsed && (
        <div className="flex items-center">
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${badgeColorClasses[badgeColor]} font-semibold`}>
              {badge}
            </span>
          )}
          {hasSubmenu && (
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
              isExpanded 
                ? "rotate-90 text-slate-200" 
                : "text-slate-400 group-hover:text-slate-200"
            }`} />
          )}
        </div>
      )}
      
      {/* Show badge as a dot when collapsed */}
      {collapsed && badge && (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          badgeColor === "amber" ? "bg-amber-400" : 
          badgeColor === "purple" ? "bg-purple-400" :
          badgeColor === "emerald" ? "bg-emerald-400" :
          badgeColor === "indigo" ? "bg-indigo-400" : "bg-blue-400"
        }`}></div>
      )}
    </Button>
  );
}
