"use client";

import Sidenv from "@/components/Navbar/SideNav";
import Topnav from "@/components/Navbar/TopNav";
import { ValidateUSR } from "./AuthContext";
import { usePathname } from "next/navigation";
import { PageHeightTracker } from "@/components/hooks/PageHeightTracker";

export default function ChildRender({ children }) {
  const pathname = usePathname();
  if (pathname === "/login") {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ValidateUSR>
        <Sidenv />
        <div className="flex-1 flex flex-col">
          <Topnav />
          <main className="flex-1">
            <PageHeightTracker>{children}</PageHeightTracker>
          </main>
        </div>
      </ValidateUSR>
    </div>
  );
}
