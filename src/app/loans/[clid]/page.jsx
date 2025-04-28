"use client";

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Building2, 
  BarChart3, 
  DollarSign, 
  Landmark, 
  LineChart, 
  TrendingUp,
  Phone,
  UserCheck,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const router = useRouter();
  const [selectedOfficer, setSelectedOfficer] = useState("Select CRO Officer");
  
  const financialProducts = [
    {
      title: "Business Loan",
      description: "Expand your business with a tailored loan.",
      icon: Building2,
      color: "bg-blue-500",
      path: 'loans/business-loan'
    },
    {
      title: "Auto Loan (Leasing)",
      description: "Flexible leasing options for your business needs.",
      icon: BarChart3,
      color: "bg-green-500",
      path: 'loans/high-draft'
    }
  ];

  // Mock client data
  const clientInfo = {
    name: "Shalitha Madhuwantha",
    id: "C-2025-0042",
    telephone: "070 4 333 111"
  };

  const croOfficers = [
    "Sathira Naveen",
    "Hansi Hansi",
  ];
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Client Information Card */}
          <Card className="w-full mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-1"></div>
              <div className="flex flex-col md:flex-row justify-between p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Client Name</p>
                      <p className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{clientInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Client ID</p>
                      <p className="font-medium">{clientInfo.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Telephone</p>
                      <p className="font-medium">{clientInfo.telephone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col justify-center">
                  <p className="text-sm text-gray-500 mb-2">Account Manager</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-60 flex justify-between items-center">
                        <span>{selectedOfficer}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full md:w-60">
                      {croOfficers.map((officer, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedOfficer(officer)}
                        >
                          {officer}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Financial Solutions
            </h1>
            <p className="text-sm text-gray-500">
              Select the financial product that best suits your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {financialProducts.map((product, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(product.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.description}
                      </p>
                      <Button className="mt-4 text-sm">
                        Let's Start!
                      </Button>
                    </div>
                    <div className={`p-3 md:p-4 rounded-full ${product.color} text-white shadow-md ml-4`}>
                      <product.icon className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export function BusinessLoan() {
  const [selectedOfficer, setSelectedOfficer] = useState("Select CRO Officer");
  
  // Mock client data
  const clientInfo = {
    name: "Acme Corporation",
    id: "ACME-2025-0042",
    telephone: "+1 (555) 123-4567"
  };

  const croOfficers = [
    "Sarah Johnson",
    "Michael Chen",
    "Emma Rodriguez",
    "David Kim",
    "Lisa Patel"
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Client Information Card */}
          <Card className="w-full mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-1"></div>
              <div className="flex flex-col md:flex-row justify-between p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Client Name</p>
                      <p className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{clientInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Client ID</p>
                      <p className="font-medium">{clientInfo.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Telephone</p>
                      <p className="font-medium">{clientInfo.telephone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col justify-center">
                  <p className="text-sm text-gray-500 mb-2">Account Manager</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-60 flex justify-between items-center">
                        <span>{selectedOfficer}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full md:w-60">
                      {croOfficers.map((officer, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedOfficer(officer)}
                        >
                          {officer}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white shadow-md mr-4">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                Business Loan
              </h1>
              <p className="text-sm text-gray-500">
                Our business loans provide you with the necessary funds to expand and grow.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-4">
              Flexible repayment options available tailored to your business cash flow.
            </p>
            <Button>Apply Now</Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export function HighDraft() {
  const [selectedOfficer, setSelectedOfficer] = useState("Select CRO Officer");
  
  // Mock client data
  const clientInfo = {
    name: "Acme Corporation",
    id: "ACME-2025-0042",
    telephone: "+1 (555) 123-4567"
  };

  const croOfficers = [
    "Sarah Johnson",
    "Michael Chen",
    "Emma Rodriguez",
    "David Kim",
    "Lisa Patel"
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Client Information Card */}
          <Card className="w-full mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-green-500 to-green-700 p-1"></div>
              <div className="flex flex-col md:flex-row justify-between p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Client Name</p>
                      <p className="font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md">{clientInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Client ID</p>
                      <p className="font-medium">{clientInfo.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Telephone</p>
                      <p className="font-medium">{clientInfo.telephone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col justify-center">
                  <p className="text-sm text-gray-500 mb-2">Account Manager</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-60 flex justify-between items-center">
                        <span>{selectedOfficer}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full md:w-60">
                      {croOfficers.map((officer, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedOfficer(officer)}
                        >
                          {officer}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6 flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white shadow-md mr-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                High Draft (Leasing)
              </h1>
              <p className="text-sm text-gray-500">
                Get the best leasing solutions tailored for your business needs.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-4">
              Affordable rates and easy approval process designed for quick business financing.
            </p>
            <Button>Apply Now</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
