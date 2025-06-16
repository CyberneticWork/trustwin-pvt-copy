// app/finance/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ArrowUpRight,
  CreditCard,
  Users,
  Calendar,
  Clock,
  XCircle,
  CheckCircle,
  FileText,
  LineChart,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FinanceDetailsCard from "@/components/finance-approval/finance-details-card";

export default function FinanceDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    approved: 0,
    rejected: 0,
    autoLoans: { total: 0, waiting: 0 },
    businessLoans: { total: 0, waiting: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch statistics
        const statsResponse = await fetch('/api/finance-approval/statistics');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch finance statistics');
        }
        
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        // Fetch recent loans
        const loansResponse = await fetch('/api/finance-approval?limit=5');
        if (loansResponse.ok) {
          const loansData = await loansResponse.json();
          if (loansData.success) {
            setRecentLoans(loansData.data || []);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching finance data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  const handleNavigateToFinanceApproval = () => {
    router.push('/finance/finance-approvals');
  };

  const handleViewLoan = async (loan) => {
    if (loan.status === "Approved") {
      // Fetch loan details if needed
      setSelectedLoan({ ...loan, loading: true });
      setIsDialogOpen(true);

      try {
        const response = await fetch(`/api/finance-approval/details?id=${loan.id}`);
        const data = await response.json();
        if (data.success) {
          setSelectedLoan({ ...loan, loading: false, details: data.data });
        } else {
          setSelectedLoan({ ...loan, loading: false, error: data.error || "Failed to fetch details" });
        }
      } catch (err) {
        setSelectedLoan({ ...loan, loading: false, error: err.message });
      }
    } else {
      router.push(`/finance/finance-approvals?id=${loan.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl">Loading finance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-4xl mb-4">
          <XCircle size={48} />
        </div>
        <p className="text-xl text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-semi-bold">Finance Dashboard</h1>
          <p className="text-gray-500">Manage loan approvals and financial statistics</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={handleNavigateToFinanceApproval}
            className="flex items-center space-x-2"
          >
            <span>Loan Approvals</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Waiting for Approval</p>
                <p className="text-2xl font-bold">{stats.waiting}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved Loans</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected Loans</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loan Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Auto Loans</p>
                  <p className="text-sm font-medium">{stats.autoLoans?.total || 0}</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ 
                      width: `${stats.total > 0 ? (stats.autoLoans?.total / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Business Loans</p>
                  <p className="text-sm font-medium">{stats.businessLoans?.total || 0}</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full" 
                    style={{ 
                      width: `${stats.total > 0 ? (stats.businessLoans?.total / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Distribution of loans by type</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Auto Loans</p>
                  <p className="text-sm font-medium">{stats.autoLoans?.waiting || 0}</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full rounded-full" 
                    style={{ 
                      width: `${stats.waiting > 0 ? (stats.autoLoans?.waiting / stats.waiting) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Business Loans</p>
                  <p className="text-sm font-medium">{stats.businessLoans?.waiting || 0}</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-400 h-full rounded-full" 
                    style={{ 
                      width: `${stats.waiting > 0 ? (stats.businessLoans?.waiting / stats.waiting) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-gray-500">Loans waiting for approval</p>
            <Button variant="outline" size="sm" onClick={handleNavigateToFinanceApproval}>
              View All
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Loan Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Loan Requests</CardTitle>
          <CardDescription>Latest loan requests that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.id}</TableCell>
                    <TableCell>{loan.customerName}</TableCell>
                    <TableCell>{loan.loanType}</TableCell>
                    <TableCell>{loan.revenueAmount}</TableCell>
                    <TableCell>{loan.applicationDate}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {loan.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewLoan(loan)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex justify-center items-center h-32 text-gray-500">
              No recent loan requests found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLoan ? `Loan Details: ${selectedLoan.id}` : "Loan Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <FinanceDetailsCard
              loan={selectedLoan}
              onClose={() => setIsDialogOpen(false)}
              // No approve/reject for approved loans
              isLoading={selectedLoan.loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
