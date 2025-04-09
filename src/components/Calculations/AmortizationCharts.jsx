"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chart, registerables } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

/**
 * AmortizationCharts Component
 * Renders visual charts for auto loan data visualization with LKR currency
 * 
 * @param {Object} amortizationData - The loan calculation results
 */
export function AmortizationCharts({ amortizationData }) {
  // Format currency for display in charts (LKR)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Pie chart data - Principal vs Interest
  const breakdownData = {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [amortizationData.amountFinanced, amortizationData.totalInterest],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#047857', '#b91c1c'],
        borderWidth: 1
      }
    ]
  };
  
  // Bar chart data - Yearly payment breakdown
  const getYearlyAmortizationData = () => {
    const years = Math.ceil(amortizationData.loanTermMonths / 12);
    const labels = [];
    const principalData = [];
    const interestData = [];
    
    for (let year = 1; year <= years; year++) {
      labels.push(`Year ${year}`);
      
      // Calculate total principal and interest for this year
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, amortizationData.loanTermMonths);
      
      // Sum up the principal and interest for all months in this year
      for (let month = startMonth; month < endMonth; month++) {
        const payment = amortizationData.amortizationSchedule[month];
        if (payment) {
          yearlyPrincipal += payment.principalPayment;
          yearlyInterest += payment.interestPayment;
        }
      }
      
      principalData.push(yearlyPrincipal);
      interestData.push(yearlyInterest);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Principal',
          data: principalData,
          backgroundColor: '#10b981'
        },
        {
          label: 'Interest',
          data: interestData,
          backgroundColor: '#ef4444'
        }
      ]
    };
  };
  
  // Get the data for yearly breakdown
  const barChartData = getYearlyAmortizationData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Payments</TabsTrigger>
          </TabsList>
          
          {/* Pie Chart - Cost Breakdown */}
          <TabsContent value="breakdown" className="pt-4">
            <div className="h-[300px] flex flex-col items-center">
              <Pie 
                data={breakdownData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw;
                          const percentage = ((value / (amortizationData.amountFinanced + amortizationData.totalInterest)) * 100).toFixed(1);
                          return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Principal</p>
                <p className="font-medium text-emerald-700">{formatCurrency(amortizationData.amountFinanced)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest</p>
                <p className="font-medium text-red-700">{formatCurrency(amortizationData.totalInterest)}</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Bar Chart - Yearly Payment Breakdown */}
          <TabsContent value="yearly" className="pt-4">
            <div className="h-[300px]">
              <Bar 
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || '';
                          const value = context.raw;
                          return `${label}: ${formatCurrency(value)}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}