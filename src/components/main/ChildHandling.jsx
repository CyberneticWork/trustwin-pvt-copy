"use client";

import Sidenv from "@/components/Navbar/SideNav";
import Topnav from "@/components/Navbar/TopNav";
import { ValidateUSR } from "./AuthContext";

import { usePathname } from "next/navigation"; 

export default function ChildRender({ children }) {
  const pathname = usePathname(); 
  return (
    <>
      {pathname === "/login" ? (
        <>{children}</>
      ) : (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
          <ValidateUSR>
            <Sidenv />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Topnav />
              {children}
            </div>
          </ValidateUSR>
        </div>
      )}
    </>
  );
}
