"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Users, DollarSign, Calendar } from "lucide-react";
import Topnav from "@/components/Navbar/TopNav";

export default function LoanManagement() {
  const [greeting, setGreeting] = useState("");
  const [timeEmojis, setTimeEmojis] = useState([]);
  const [userName, setUserName] = useState("");
  const [motivationalPhrase, setMotivationalPhrase] = useState("");

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserName(userData.username || "User");
    }

    // Set greeting based on time of day with fun emojis including a face emoji
    const hours = new Date().getHours();
    
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
      // Morning emojis: sunrise, coffee, happy face
      setTimeEmojis(["🌅", "☕", "😊"]);
      setMotivationalPhrase("Let's make today productive!");
    } else if (hours >= 12 && hours < 17) {
      setGreeting("Good Afternoon");
      // Afternoon emojis: sun, rocket, determined face
      setTimeEmojis(["☀️", "🚀", "😎"]);
      setMotivationalPhrase("Keep up the momentum!");
    } else if (hours >= 17 && hours < 20) {
      setGreeting("Good Evening");
      // Evening emojis: sunset, tea, thinking face
      setTimeEmojis(["🌆", "🍵", "😃"]);
      setMotivationalPhrase("Final push before you wrap up!");
    } else {
      setGreeting("Good Night");
      // Night emojis: moon, sparkles, tired but proud face
      setTimeEmojis(["🌙", "✨", "😌"]);
      setMotivationalPhrase("Planning tomorrow's success?");
    }
  }, []);

  const loanStats = [
    {
      title: "Active Loans",
      value: "24",
      icon: CreditCard,
      color: "bg-blue-500",
    },
    {
      title: "Total Portfolio",
      value: "LKR 1.24M",
      icon: DollarSign,
      color: "bg-green-500",
    },
    { title: "Clients", value: "152", icon: Users, color: "bg-purple-500" },
    {
      title: "Pending Approvals",
      value: "7",
      icon: Calendar,
      color: "bg-amber-500",
    },
  ];

  const recentLoans = [
    {
      id: "L-7829",
      client: "Sarah Johnson",
      clientId: "C-1234",
      nic: "987654321V",
      amount: "$24,500",
      status: "Active",
      date: "Mar 5, 2025",
    },
    {
      id: "L-7830",
      client: "Miguel Rodriguez",
      clientId: "C-1235",
      nic: "876543210V",
      amount: "$135,000",
      status: "Pending",
      date: "Mar 6, 2025",
    },
    {
      id: "L-7831",
      client: "Taylor Smith",
      clientId: "C-1236",
      nic: "765432109V",
      amount: "$78,300",
      status: "Active",
      date: "Mar 7, 2025",
    },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Add your logout logic here
    alert("Logging out...");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* side nav here */}

      {/* Main Content */}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        {/* top nav here */}
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {greeting}, {userName} {timeEmojis.map((emoji, index) => (
                <span key={index} className="ml-1">{emoji}</span>
              ))}
            </h1>
            <p className="text-base text-gray-600 mt-2 font-medium">
              {motivationalPhrase} Here's your loan portfolio overview.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loanStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>
                      <p className="text-xl md:text-2xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-2 md:p-3 rounded-full ${stat.color} text-white`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Loans Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Loans
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Latest loan activities
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Loan ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Client ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      NIC
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {loan.client}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {loan.clientId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {loan.nic}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {loan.amount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            loan.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {loan.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
