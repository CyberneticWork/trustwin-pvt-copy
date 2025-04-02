"use client";

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  BarChart3, 
  DollarSign, 
  Landmark, 
  LineChart, 
  TrendingUp 
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  
  const financialProducts = [
    {
      title: "Business Loan",
      description: "Expand your business with a tailored loan.",
      icon: Building2,  // Changed to a building icon to represent business
      color: "bg-blue-500",
      path: 'loans/business-loan'
    },
    {
      title: "Auto Loan (Leasing)",
      description: "Flexible leasing options for your business needs.",
      icon: BarChart3,  // Changed to bar chart for financial growth representation
      color: "bg-green-500",
      path: 'loans/high-draft'
    }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
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
                      <p className="text-lg font-semibold  text-gray-800">
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
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white shadow-md mr-4">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold  text-gray-800">
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
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white shadow-md mr-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold  text-gray-800">
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