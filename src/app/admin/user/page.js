"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Pencil, Trash2, Plus, X, RefreshCw, Lock, Shield, User, Mail, Phone, BarChart, Building } from "lucide-react";
import ACLData from "@/lib/jsons/ACL.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserManagement() {
  // Admin data fetched from API
  const [originalAdmins, setOriginalAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch admins from API
  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/employees/getadmns');
      const json = await response.json();
      if (json.code === "SUCCESS") {
        // Map API data to expected format for table
        const mappedAdmins = json.data.map(emp => ({
          id: emp.id,
          username: emp.username,
          name: emp.name,
          email: emp.email,
          roll: emp.roll,
          empid: emp.empid,
          tellno: emp.tellno,
          branchID: emp.branchID,
          access: emp.access || 0 // Default to 0 if access is not provided
        }));
        setOriginalAdmins(mappedAdmins);
      } else {
        console.error("Failed to fetch admins:", json.message);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches');
        const json = await response.json();
        if (json.code === "SUCCESS") {
          setBranches(json.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Real-time filtered admins using useMemo for performance
  const filteredAdmins = useMemo(() => {
    if (!search.trim()) return originalAdmins;
    
    const searchTerms = search.toLowerCase().split(" ").filter(term => term);
    
    return originalAdmins.filter(admin => {
      const searchableText = `${admin.username} ${admin.name} ${admin.email}`.toLowerCase();
      // Check if all search terms are included in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [originalAdmins, search]);

  const maxPage = Math.max(1, Math.ceil(filteredAdmins.length / limit));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleOpenEditDialog = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      empid: admin.empid,
      roll: admin.roll,
      tellno: admin.tellno,
      branchID: admin.branchID.toString() // Convert to string to match select value
    });
    setShowEditDialog(true);
  };

  const handleResetPassword = async (adminId) => {
    console.log(adminId);
    

    const id = JSON.parse(localStorage.getItem('user'))['id'];
    console.log(id);

    try {
      // Verify the password using the API
      const verifyResponse = await fetch('/api/employees/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          password: currentPassword
        })
      });
      const verifyJson = await verifyResponse.json();

      if (verifyJson.code === "SUCCESS") {
        // If password is correct, proceed with reset
        const response = await fetch('/api/employees/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: adminId
          })
        });
        const json = await response.json();

        if (json.code === "SUCCESS") {
          alert("Password reset successfully to Password@123");
          setShowPasswordDialog(false);
          setCurrentPassword('');
        } else {
          alert("Failed to reset password: " + json.message);
        }
      } else {
        alert(verifyJson.message || "Incorrect current password. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Error resetting password");
    }
  };

  const handleAccessToggle = async (adminId, access) => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees/toggle-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: adminId,
          access: access
        })
      });
      const json = await response.json();
      
      if (json.code === "SUCCESS") {
        // Update the admin's access status in the local state
        setOriginalAdmins(prev => prev.map(admin => 
          admin.id === adminId ? { ...admin, access: access } : admin
        ));
        // Refresh the table to ensure we get the latest data
        fetchAdmins();
        alert("Access status updated successfully");
      } else {
        alert("Failed to update access status: " + json.message);
      }
    } catch (error) {
      console.error("Error updating access:", error);
      alert("Error updating access status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      const response = await fetch('/api/employees/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedAdmin.id,
          ...formData
        })
      });
      const json = await response.json();
      if (json.code === "SUCCESS") {
        alert("Admin updated successfully");
        setShowEditDialog(false);
        // Refresh the table by resetting the page and fetching new data
        setPage(1);
        fetchAdmins();
      } else {
        alert("Failed to update admin: " + json.message);
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Error updating admin");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const currentPageData = filteredAdmins.slice((page - 1) * limit, page * limit);

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <Card className="max-w-7xl mx-auto shadow-lg border-0 overflow-hidden bg-white rounded-xl">
        <CardHeader className="bg-white p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800">
                Admin User Management
              </CardTitle>
            </div>
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name, email or username..."
                className="pl-10 pr-10 py-2 border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-2 top-2 h-6 w-6 hover:bg-slate-100 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 py-0">
          <ScrollArea className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-medium text-slate-700">User</TableHead>
                  <TableHead className="font-medium text-slate-700">Contact</TableHead>
                  <TableHead className="font-medium text-slate-700">Role & ID</TableHead>
                  <TableHead className="font-medium text-slate-700">Access</TableHead>
                  <TableHead className="font-medium text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.length > 0 ? (
                  currentPageData.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-slate-50">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-blue-100 text-blue-700">
                            <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-800">{admin.name}</div>
                            <div className="text-sm text-slate-500">@{admin.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm text-slate-700">
                            <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            {admin.email}
                          </div>
                          {admin.tellno && (
                            <div className="flex items-center text-sm text-slate-700">
                              <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              {admin.tellno}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
                            <User className="h-3 w-3 mr-1" />
                            {admin.roll}
                          </Badge>
                          <div className="text-sm text-slate-500 flex items-center">
                            <BarChart className="h-3.5 w-3.5 mr-1" />
                            ID: {admin.empid}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center">
                          <Button
                            variant={admin.access === 1 ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => handleAccessToggle(admin.id, admin.access === 1 ? 0 : 1)}
                            className={`
                              px-3 py-1 h-8 rounded-md transition-all
                              ${admin.access === 1 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'}
                            `}
                          >
                            <Lock className="h-3.5 w-3.5 mr-1.5" />
                            {admin.access === 1 ? 'Allowed' : 'Denied'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(admin)}
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 px-3 rounded-md"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowPasswordDialog(true);
                            }}
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 h-8 px-3 rounded-md"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Reset
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Search className="h-8 w-8 mb-2 opacity-30" />
                        <p>No admins found</p>
                        {search && (
                          <Button 
                            variant="link" 
                            onClick={clearSearch}
                            className="mt-2 text-blue-600"
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-slate-500 mb-4 sm:mb-0">
            Showing {Math.min(filteredAdmins.length, (page - 1) * limit + 1)} - {Math.min(filteredAdmins.length, page * limit)} of {filteredAdmins.length} admins
          </div>
          <Pagination
            currentPage={page}
            totalPages={maxPage}
            onPageChange={handlePageChange}
          />
        </CardFooter>
      </Card>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-4 bg-slate-50 border-b">
            <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-red-500" />
              Reset Admin Password
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-1.5">
              This will reset the password for {selectedAdmin?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Admin Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full"
                  placeholder="Enter your admin password"
                />
              </div>
              <div className="text-sm text-slate-500 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                  <Lock className="h-4 w-4" />
                  Security verification required
                </div>
                Please enter your current admin password to authenticate this action.
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-slate-50 px-6 py-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowPasswordDialog(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleResetPassword(selectedAdmin.id)}
              disabled={!currentPassword}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-4 bg-slate-50 border-b">
            <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-600" />
              Edit Admin User
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-1.5">
              Make changes to {selectedAdmin?.name}'s information
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  User Information
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="roll" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role
                  </label>
                  <Input
                    id="roll"
                    name="roll"
                    value={formData.roll}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Contact Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Contact Information
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="tellno" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <Input
                    id="tellno"
                    name="tellno"
                    value={formData.tellno}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="empid" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Employee ID
                  </label>
                  <Input
                    id="empid"
                    name="empid"
                    value={formData.empid}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Branch Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Building className="h-4 w-4 text-blue-600" />
                Branch Information
              </div>
              
              <div>
                <label htmlFor="branchID" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Branch Location
                </label>
                <Select
                  id="branchID"
                  name="branchID"
                  value={formData.branchID}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    branchID: value
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branch} ({branch.shortcode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-slate-50 px-6 py-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowEditDialog(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAdmin}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}