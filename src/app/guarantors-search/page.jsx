// app/guarantors-search/page.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  User,
  FileText,
  Phone,
  CreditCard,
  Users
} from "lucide-react";

export default function GuarantorsSearchPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState("clientid");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const recordsPerPage = 10;

  // State for data from API
  const [guarantors, setGuarantors] = useState([]);
  const [originalGuarantors, setOriginalGuarantors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byClientID: 0,
    byLoanID: 0,
    byNIC: 0,
    byMobile: 0
  });

  // Fetch guarantor data on component mount
  useEffect(() => {
    const fetchGuarantors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/guarantors');

        if (!response.ok) {
          throw new Error('Failed to fetch guarantor data');
        }

        const data = await response.json();

        if (data.success) {
          setGuarantors(data.data || []);
          setOriginalGuarantors(data.data || []);
          setStats({
            total: data.data.length,
            byClientID: 0,
            byLoanID: 0,
            byNIC: 0,
            byMobile: 0
          });
        } else {
          throw new Error(data.error || 'Failed to fetch guarantor data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching guarantor data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuarantors();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setGuarantors(originalGuarantors);
      setCurrentPage(1);
      return;
    }

    setIsSearching(true);
    setCurrentPage(1);

    try {
      // Send search request to API
      const response = await fetch(`/api/guarantors?type=${searchType}&value=${encodeURIComponent(searchValue.trim())}`);
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGuarantors(data.data || []);
        
        // Update stats based on search type
        setStats(prev => ({
          ...prev,
          byClientID: searchType === 'clientid' ? data.data.length : prev.byClientID,
          byLoanID: searchType === 'loanid' ? data.data.length : prev.byLoanID,
          byNIC: searchType === 'nic' ? data.data.length : prev.byNIC,
          byMobile: searchType === 'mobile' ? data.data.length : prev.byMobile
        }));
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(`Search error: ${err.message}`);
      console.error('Error during search:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search
  const resetSearch = () => {
    setSearchValue("");
    setSearchType("clientid");
    setGuarantors(originalGuarantors);
    setCurrentPage(1);
    
    setStats(prevStats => ({
      ...prevStats,
      byClientID: 0,
      byLoanID: 0,
      byNIC: 0,
      byMobile: 0
    }));
  };

  // View guarantor details
  const handleViewDetails = async (guarantor) => {
    try {
      setSelectedGuarantor({ ...guarantor, loading: true });
      setIsDialogOpen(true);

      // Fetch additional details if needed
      const response = await fetch(`/api/guarantors/details?id=${guarantor.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch guarantor details');
      }

      const detailData = await response.json();

      if (detailData.success) {
        setSelectedGuarantor({
          ...guarantor,
          loading: false,
          details: detailData.data
        });
      } else {
        throw new Error(detailData.error || 'Failed to fetch guarantor details');
      }
    } catch (error) {
      console.error('Error fetching guarantor details:', error);
      // Still show basic details even if detailed fetch fails
      setSelectedGuarantor({
        ...guarantor,
        loading: false,
        error: error.message
      });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(guarantors.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = guarantors.slice(indexOfFirstRecord, indexOfLastRecord);

  // Pagination navigation
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl">Loading guarantor data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-red-600">Error: {error}</p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Guarantors Search</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Guarantors</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">By Client ID</p>
                <p className="text-xl font-bold">{stats.byClientID}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <User className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">By Loan ID</p>
                <p className="text-xl font-bold">{stats.byLoanID}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">By NIC</p>
                <p className="text-xl font-bold">{stats.byNIC}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">By Mobile</p>
                <p className="text-xl font-bold">{stats.byMobile}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 p-4">
          <CardTitle className="text-lg">Guarantors List</CardTitle>

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select 
              value={searchType} 
              onValueChange={setSearchType}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Search by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clientid">Client ID</SelectItem>
                <SelectItem value="loanid">Loan ID</SelectItem>
                <SelectItem value="nic">NIC</SelectItem>
                <SelectItem value="mobile">Mobile Number</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder={`Search by ${
                  searchType === "clientid" ? "client ID" :
                  searchType === "loanid" ? "loan ID" :
                  searchType === "nic" ? "NIC" : "mobile number"
                }...`}
                className="pl-8"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                variant="default"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <Button 
                onClick={resetSearch} 
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Guarantor Name</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contract ID</th>
                  <th className="px-4 py-3">NIC</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Relation</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.length > 0 ? (
                  currentRecords.map((guarantor) => (
                    <tr key={guarantor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {guarantor.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {guarantor.customerName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {guarantor.contractid}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {guarantor.nic}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {guarantor.number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-800">
                          {guarantor.relation}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {guarantor.district}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(guarantor)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No guarantors found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700 mx-2 self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastRecord, guarantors.length)}
                    </span>{" "}
                    of <span className="font-medium">{guarantors.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 ${
                            pageNumber === currentPage
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guarantor Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Guarantor Details</DialogTitle>
          </DialogHeader>
          
          {selectedGuarantor && (
            <div className="grid gap-4 py-4">
              {selectedGuarantor.loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedGuarantor.error ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-red-500">Error loading details: {selectedGuarantor.error}</p>
                  <p className="mt-4">Showing available information:</p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Name</h3>
                  <p>{selectedGuarantor.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">NIC</h3>
                  <p>{selectedGuarantor.nic}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Gender</h3>
                  <p>{selectedGuarantor.gender === 1 ? 'Male' : 'Female'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Date of Birth</h3>
                  <p>{new Date(selectedGuarantor.dob).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Relation to Customer</h3>
                <p>{selectedGuarantor.relation}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Address</h3>
                <p>{selectedGuarantor.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Province</h3>
                  <p>{selectedGuarantor.province}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">District</h3>
                  <p>{selectedGuarantor.district}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">GS Division</h3>
                  <p>{selectedGuarantor.gs}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">DS Division</h3>
                  <p>{selectedGuarantor.ds}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Mobile Number</h3>
                  <p>{selectedGuarantor.number}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Monthly Income</h3>
                  <p>{selectedGuarantor.income.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Bank</h3>
                  <p>{selectedGuarantor.bankname}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Account Number</h3>
                  <p>{selectedGuarantor.accountno}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Customer Name</h3>
                  <p>{selectedGuarantor.customerName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Contract ID</h3>
                  <p>{selectedGuarantor.contractid}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
