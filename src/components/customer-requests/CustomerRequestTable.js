"use client";

import { useState, useEffect } from "react";
import RequestDetailModal from "./RequestDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CustomerRequestTable({ data }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    location: 'all'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract unique locations for filter dropdown
  const locations = ['all', ...new Set(data.map(item => 
    item.pendingCustomerData.district || 'Unknown'
  ))];

  // Apply filters when changed
  useEffect(() => {
    let results = [...data];
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(item => 
        item.pendingCustomerData.fullname.toLowerCase().includes(searchTerm) ||
        item.pendingCustomerData.nic.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    if (filters.status !== 'all') {
      results = results.filter(item => item.status === filters.status);
    }
    
    // Location filter
    if (filters.location !== 'all') {
      results = results.filter(item => 
        item.pendingCustomerData.district === filters.location
      );
    }
    
    setFilteredData(results);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, data]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Modal handlers
  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch('/api/requesthandel/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (result.code === 'SUCCESS') {
        closeModal();
        // Refresh the data
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to approve request');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleReject = async (id, note) => {
    try {
      const response = await fetch('/api/requesthandel/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          comment: note || 'No reason provided'
        })
      });

      const result = await response.json();

      if (result.code === 'SUCCESS') {
        closeModal();
        // Refresh the data
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to reject request');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Handle filters
  const handleSearchChange = (e) => {
    setFilters({...filters, search: e.target.value});
  };

  const handleStatusChange = (value) => {
    setFilters({...filters, status: value});
  };

  const handleLocationChange = (value) => {
    setFilters({...filters, location: value});
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      location: 'all'
    });
  };

  return (
    <>
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Customer Update Requests
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or NIC..."
                className="pl-9"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-3 items-center">
              <Select 
                value={filters.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {/* <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem> */}
                </SelectContent>
              </Select>
              
            
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={clearFilters}
                className="shrink-0"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Results info */}
          <div className="text-sm text-gray-500 mb-2">
            Showing {paginatedData.length} of {filteredData.length} requests
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Full Name</TableHead>
                  <TableHead className="w-[150px]">NIC</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((req) => (
                    <TableRow key={req.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {req.pendingCustomerData.fullname}
                      </TableCell>
                      <TableCell>{req.pendingCustomerData.nic}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {req.pendingCustomerData.district || req.pendingCustomerData.province || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-blue-600"
                          onClick={() => openModal(req)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      No matching requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}

// Helper component for status badges
const StatusBadge = ({ status }) => {
  const variants = {
    Pending: { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    Approved: { className: "bg-green-100 text-green-800 hover:bg-green-100" },
    Rejected: { className: "bg-red-100 text-red-800 hover:bg-red-100" },
  };

  const variant = variants[status] || variants.Pending;

  return (
    <Badge variant="outline" className={variant.className}>
      {status === "Pending" && <Filter className="h-3 w-3 mr-1" />}
      {status === "Approved" && <Check className="h-3 w-3 mr-1" />}
      {status === "Rejected" && <X className="h-3 w-3 mr-1" />}
      {status}
    </Badge>
  );
};