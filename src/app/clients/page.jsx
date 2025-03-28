"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar,
  Phone,
  Home,
  Mail,
  CreditCard,
  Heart,
  Check,
  X
} from "lucide-react";

export default function ClientManagement() {
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clients, setClients] = useState([
    {
      id: "C-1234",
      title: "Mr.",
      fullName: "John Anderson",
      nic: "198765432V",
      permanentAddress: "123 Oak Street, Colombo 05",
      mailingAddress: "123 Oak Street, Colombo 05",
      dob: "1987-05-12",
      mobileNumber1: "+94 77 123 4567",
      mobileNumber2: "",
      maritalStatus: "Married",
      spouseName: "Elizabeth Anderson",
      addedDate: "Feb 10, 2025",
      status: "Active"
    },
    {
      id: "C-1235",
      title: "Mrs.",
      fullName: "Priya Fernando",
      nic: "199023456V",
      permanentAddress: "45 Palm Avenue, Colombo 06",
      mailingAddress: "P.O. Box 789, Colombo 01",
      dob: "1990-11-23",
      mobileNumber1: "+94 76 234 5678",
      mobileNumber2: "+94 71 345 6789",
      maritalStatus: "Married",
      spouseName: "Rohan Fernando",
      addedDate: "Feb 15, 2025",
      status: "Active"
    },
    {
      id: "C-1236",
      title: "Ven.",
      fullName: "Mahanama Thero",
      nic: "197545678V",
      permanentAddress: "Sri Vishnu Temple, Temple Road, Kandy",
      mailingAddress: "Sri Vishnu Temple, Temple Road, Kandy",
      dob: "1975-01-30",
      mobileNumber1: "+94 70 345 6789",
      mobileNumber2: "",
      maritalStatus: "Single",
      spouseName: "",
      addedDate: "Feb 20, 2025",
      status: "Active"
    }
  ]);

  const [newClient, setNewClient] = useState({
    title: "Mr.",
    fullName: "",
    nic: "",
    permanentAddress: "",
    mailingAddress: "",
    usePermAddress: true,
    dob: "",
    mobileNumber1: "",
    mobileNumber2: "",
    maritalStatus: "Single",
    spouseName: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const toggleAddClientForm = () => {
    setShowAddClientForm(!showAddClientForm);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "usePermAddress") {
      setNewClient(prev => ({
        ...prev,
        [name]: checked,
        mailingAddress: checked ? prev.permanentAddress : prev.mailingAddress
      }));
    } else if (name === "permanentAddress") {
      setNewClient(prev => ({
        ...prev,
        [name]: value,
        mailingAddress: prev.usePermAddress ? value : prev.mailingAddress
      }));
    } else {
      setNewClient(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    
    // Generate a new client ID
    const newId = `C-${1237 + clients.length}`;
    
    // Get current date
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'short' });
    const day = today.getDate();
    const year = today.getFullYear();
    const formattedDate = `${month} ${day}, ${year}`;
    
    // Create new client object
    const clientToAdd = {
      id: newId,
      title: newClient.title,
      fullName: newClient.fullName,
      nic: newClient.nic,
      permanentAddress: newClient.permanentAddress,
      mailingAddress: newClient.usePermAddress ? newClient.permanentAddress : newClient.mailingAddress,
      dob: newClient.dob,
      mobileNumber1: newClient.mobileNumber1,
      mobileNumber2: newClient.mobileNumber2,
      maritalStatus: newClient.maritalStatus,
      spouseName: newClient.spouseName,
      addedDate: formattedDate,
      status: "Active"
    };
    
    // Add to clients list
    setClients([...clients, clientToAdd]);
    
    // Reset form
    setNewClient({
      title: "Mr.",
      fullName: "",
      nic: "",
      permanentAddress: "",
      mailingAddress: "",
      usePermAddress: true,
      dob: "",
      mobileNumber1: "",
      mobileNumber2: "",
      maritalStatus: "Single",
      spouseName: ""
    });
    
    // Close form
    setShowAddClientForm(false);
  };

  // Filter clients based on search term and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         client.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold  text-gray-800">
                Client Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage your client portfolio and add new clients
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={toggleAddClientForm}
                className=" flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add New Client
              </Button>
            </div>
          </div>

          {/* Client Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Clients
                    </p>
                    <p className="text-xl md:text-2xl font-semibold ">
                      {clients.length}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-blue-500 text-white">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Active Clients
                    </p>
                    <p className="text-xl md:text-2xl font-semibold ">
                      {clients.filter(c => c.status === "Active").length}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-green-500 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Clients with Loans
                    </p>
                    <p className="text-xl md:text-2xl font-semibold ">
                      12
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-purple-500 text-white">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Added This Month
                    </p>
                    <p className="text-xl md:text-2xl font-semibold ">
                      3
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-amber-500 text-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Client Form - Conditionally rendered */}
          {showAddClientForm && (
            <Card className="mb-6 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add New Client
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddClient} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Title and Full Name */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <select 
                        name="title"
                        value={newClient.title}
                        onChange={handleInputChange}
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Miss">Miss</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Ven.">Ven.</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <input 
                        type="text"
                        name="fullName"
                        value={newClient.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter client's full name"
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* NIC Number and DOB */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">NIC Number</label>
                      <input 
                        type="text"
                        name="nic"
                        value={newClient.nic}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. 199012345678V"
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <input 
                        type="date"
                        name="dob"
                        value={newClient.dob}
                        onChange={handleInputChange}
                        required
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={newClient.maritalStatus}
                        onChange={handleInputChange}
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    
                    {/* Spouse Name - Conditionally rendered */}
                    {newClient.maritalStatus === "Married" && (
                      <div className="flex flex-col space-y-1.5 md:col-span-3">
                        <label className="text-sm font-medium text-gray-700">Spouse Name</label>
                        <input 
                          type="text"
                          name="spouseName"
                          value={newClient.spouseName}
                          onChange={handleInputChange}
                          placeholder="Enter spouse's name"
                          className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {/* Permanent Address */}
                    <div className="flex flex-col space-y-1.5 md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">Permanent Address</label>
                      <input 
                        type="text"
                        name="permanentAddress"
                        value={newClient.permanentAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter permanent address"
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Use Permanent Address as Mailing Address Checkbox */}
                    <div className="flex items-center md:col-span-3">
                      <input 
                        type="checkbox"
                        id="usePermAddress"
                        name="usePermAddress"
                        checked={newClient.usePermAddress}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="usePermAddress" className="ml-2 block text-sm text-gray-700">
                        Use permanent address as mailing address
                      </label>
                    </div>
                    
                    {/* Mailing Address - Conditionally rendered */}
                    {!newClient.usePermAddress && (
                      <div className="flex flex-col space-y-1.5 md:col-span-3">
                        <label className="text-sm font-medium text-gray-700">Mailing Address</label>
                        <input 
                          type="text"
                          name="mailingAddress"
                          value={newClient.mailingAddress}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter mailing address"
                          className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {/* Mobile Numbers */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Mobile Number 1</label>
                      <input 
                        type="tel"
                        name="mobileNumber1"
                        value={newClient.mobileNumber1}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. +94 77 123 4567"
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Mobile Number 2 (Optional)</label>
                      <input 
                        type="tel"
                        name="mobileNumber2"
                        value={newClient.mobileNumber2}
                        onChange={handleInputChange}
                        placeholder="e.g. +94 71 234 5678"
                        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Form Buttons */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={toggleAddClientForm}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className=" text-white"
                    >
                      Add Client
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search clients by name, ID or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Client List
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIC
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added On
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {client.fullName.split(' ').map(name => name[0]).join('').substring(0, 2)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {client.title} {client.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {client.maritalStatus === "Married" ? (
                                <div className="flex items-center">
                                  <Heart className="h-3 w-3 mr-1 text-red-400" /> 
                                  <span>{client.spouseName}</span>
                                </div>
                              ) : client.maritalStatus}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.nic}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {client.mobileNumber1}
                        </div>
                        {client.mobileNumber2 && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {client.mobileNumber2}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center">
                          <Home className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={client.permanentAddress}>
                            {client.permanentAddress}
                          </span>
                        </div>
                        {client.permanentAddress !== client.mailingAddress && (
                          <div className="flex items-center text-gray-500 mt-1">
                            <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[200px]" title={client.mailingAddress}>
                              {client.mailingAddress}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.addedDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button className="text-gray-600 hover:text-gray-900">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {filteredClients.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md">
                  No clients match your search criteria. Try adjusting your filters or add a new client.
                </p>
                <Button 
                  onClick={toggleAddClientForm}
                  className="mt-4  text-white flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add New Client
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}