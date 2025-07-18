"use client";
import { useState, useEffect } from "react";
import { AutoLoanCalculator } from "@/components/Calculations/AutoLoanCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

export default function EquipmentLoanCalculatorPage() {
  const params = useParams();
  console.log(params);
  const router = useRouter();
  // Function to handle loan application
  const handlePartialPayment = async (loanId, paymentNumber, partialAmount) => {
    try {
      const response = await fetch("/api/EQloan/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loan_id: loanId,
          payment_number: paymentNumber,
          payment_date: new Date().toISOString().split("T")[0],
          amount_paid: partialAmount,
          payment_method: "cash",
          partial_payment: partialAmount,
        }),
      });

      const data = await response.json();

      if (data.code === "SUCCESS") {
        // Show success message
        toast.success("Partial payment processed successfully");
      } else {
        toast.error(data.message || "Failed to process partial payment");
      }
    } catch (error) {
      console.error("Error processing partial payment:", error);
      toast.error("Failed to process partial payment");
    }
  };

  const handleApplyLoan = async () => {
    try {
      // Get parameters from the URL
      const hash = params.hash;

      // Debug: show hash param
      console.log("params.hash:", hash);
      // Robust decode base64 hash from URL param
      let base64 = decodeURIComponent(hash);
      console.log("Base64 after decodeURIComponent:", base64);
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      console.log("Base64 after replace and pad:", base64);
      let decodedHash;
      try {
        decodedHash = atob(base64);
      } catch (e) {
        alert("Invalid or corrupted link. Please check your URL.");
        console.error("atob error:", e, "base64:", base64);
        return;
      }
      console.log("decodedHash:", decodedHash);
      const list = decodedHash.split(",");
      console.log("list after split:", list);
      if (
        list.length < 3 ||
        !list[0].includes("=") ||
        !list[1].includes("=") ||
        !list[2].includes("=")
      ) {
        alert("Decoded parameters are invalid. Please check your link.");
        return;
      }

      // Get customer ID from the URL parameter
      const customerId = list[2].split("=")[1];
      const CROid = list[1].split("=")[1];
      const Addby = list[0].split("=")[1];

      if (!customerId || !CROid || !Addby) {
        alert("Required parameters are missing");
        return;
      }

      console.log(customerId, CROid, Addby);

      // Prepare loan data
      const loanData = {
        customer_id: parseInt(customerId),
        CROid: parseInt(CROid),
        Addby: parseInt(Addby),
        equipment_price: equipmentPrice,
        down_payment: downPayment,
        trade_in_value: tradeInValue,
        loan_amount: loanAmount,
        loan_term_months: months,
        interest_rate: interestRate,
        monthly_payment: results?.payment,
        total_interest: results?.totalInterest,
        total_payable: results?.totalPayable,
        effective_rate: ((results?.totalInterest / loanAmount) * 100).toFixed(
          2
        ),
        client_receiving_amount: clientReceiving,
        initial_charges: {
          service_charges: serviceCharges,
          document_charges: documentCharges,
          insurance_premium: insurancePremium,
          introducer_commission: introducerCommission,
          other_charges: otherCharges,
          total_charges:
            serviceCharges +
            documentCharges +
            insurancePremium +
            introducerCommission +
            otherCharges,
          charges_option: initialChargesOption,
        },
        payment_schedule: results?.amortizationSchedule.map(
          (period, index) => ({
            payment_number: index + 1,
            payment_date: new Date(
              Date.now() + index * 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            payment_amount: period.payment,
            principal_amount: period.principal,
            interest_amount: period.interest,
            remaining_balance: period.balance,
          })
        ),
      };

      // Show loading state
      document.body.style.cursor = "wait";
      console.log(loanData);
      // Make API call to create loan application
      const response = await fetch("/api/EQloan/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });

      const result = await response.json();

      if (result.code === "SUCCESS") {
        // Loan application created successfully
        const loanId = result.loan_id;
        alert(
          `Loan application submitted successfully! Your loan ID is: ${loanId}`
        );
        console.log("Loan ID:", loanId);
        router.push(`/apply-for-equipment-loan/${loanId}`);

        // Optionally redirect to a confirmation page
        // window.location.href = `/loan/equipment/confirmation?loan_id=${loanId}`;
      } else {
        throw new Error(result.message || "Failed to create loan application");
      }
    } catch (error) {
      console.error("Error creating loan application:", error);
      alert("Error creating loan application: " + error.message);
    } finally {
      document.body.style.cursor = "default";
    }
  };

  // Common state
  const [equipmentPrice, setEquipmentPrice] = useState(3000000);
  const [downPayment, setDownPayment] = useState(600000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [loanAmount, setLoanAmount] = useState(2400000);
  const [months, setMonths] = useState(36);
  const [interestRate, setInterestRate] = useState(14);

  // Initial charges state
  const [showInitialCharges, setShowInitialCharges] = useState(false);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [documentCharges, setDocumentCharges] = useState(0);
  const [insurancePremium, setInsurancePremium] = useState(0);
  const [introducerCommission, setIntroducerCommission] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [initialChargesOption, setInitialChargesOption] =
    useState("capitalize");

  // Results state
  const [results, setResults] = useState(null);
  const [clientReceiving, setClientReceiving] = useState(0);

  // State for expanding the amortization table
  const [showFullAmortization, setShowFullAmortization] = useState(false);

  // Calculate loan details when parameters change
  useEffect(() => {
    // Calculate actual loan amount based on equipment price, down payment, trade-in
    let calculatedLoanAmount = equipmentPrice - downPayment - tradeInValue;

    // Calculate total initial charges
    const totalInitialCharges = showInitialCharges
      ? serviceCharges +
        documentCharges +
        insurancePremium +
        introducerCommission +
        otherCharges
      : 0;

    // Map the initial charges option to the calculator's initialPaymentOption
    let initialPaymentOption;
    switch (initialChargesOption) {
      case "capitalize":
        initialPaymentOption = "capitalizeCharges";
        break;
      case "separate":
        initialPaymentOption = "clientPay";
        break;
      case "withdraw":
        initialPaymentOption = "withdrawFromCapital";
        break;
      default:
        initialPaymentOption = "clientPay";
    }

    // Calculate client receiving amount
    let receivingAmount;
    if (!showInitialCharges) {
      receivingAmount = calculatedLoanAmount;
    } else {
      switch (initialChargesOption) {
        case "capitalize":
          receivingAmount = calculatedLoanAmount;
          break;
        case "separate":
          receivingAmount = calculatedLoanAmount;
          break;
        case "withdraw":
          receivingAmount = calculatedLoanAmount - totalInitialCharges;
          break;
        default:
          receivingAmount = calculatedLoanAmount;
      }
    }
    setClientReceiving(receivingAmount);
    setLoanAmount(calculatedLoanAmount);

    // Calculate loan results
    const calculationResults = AutoLoanCalculator(
      calculatedLoanAmount,
      interestRate,
      months,
      "monthly",
      "yearly", // Interest rate is always annual
      0, // serviceCharge is now 0, as we're using initialPayment
      totalInitialCharges,
      initialPaymentOption
    );

    console.log(calculationResults);

    setResults(calculationResults);
  }, [
    equipmentPrice,
    downPayment,
    tradeInValue,
    interestRate,
    months,
    serviceCharges,
    documentCharges,
    insurancePremium,
    introducerCommission,
    otherCharges,
    initialChargesOption,
    showInitialCharges,
  ]);

  // Format currency in LKR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get initial charges display
  const getInitialChargesDisplay = () => {
    if (!showInitialCharges) return { text: "None", color: "text-gray-500" };

    const totalCharges =
      serviceCharges +
      documentCharges +
      insurancePremium +
      introducerCommission +
      otherCharges;
    let prefix = "";
    let textColor = "";

    switch (initialChargesOption) {
      case "capitalize":
        prefix = "+";
        textColor = "text-green-600";
        break;
      case "separate":
        textColor = "text-gray-600";
        break;
      case "withdraw":
        prefix = "-";
        textColor = "text-red-600";
        break;
      default:
        textColor = "text-black";
    }

    return {
      text: `${prefix}${formatCurrency(totalCharges)}`,
      color: textColor,
    };
  };

  function robustBase64Decode(hash) {
    if (!hash || typeof hash !== "string") return null;
    try {
      let base64;
      try {
        base64 = decodeURIComponent(hash);
      } catch {
        base64 = hash;
      }
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      base64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");
      while (base64.length % 4 !== 0) base64 += "=";
      return atob(base64);
    } catch {
      return null;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        overflowX: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "semi-bold",
          marginBottom: "20px",
        }}
      >
        Equipment Loan Calculator
      </h1>

      {/* Main layout - 2 column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* Left column - Input form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Loan Details</CardTitle>
              <CardDescription>
                Enter information about the equipment and desired loan terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Equipment Price */}
                <div style={{ marginBottom: "8px" }}>
                  <Label
                    htmlFor="equipmentPrice"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Equipment Price
                  </Label>
                  <Input
                    id="equipmentPrice"
                    type="number"
                    value={equipmentPrice}
                    onChange={(e) => setEquipmentPrice(Number(e.target.value))}
                  />
                </div>

                {/* Down Payment */}
                <div style={{ marginBottom: "8px" }}>
                  <Label
                    htmlFor="downPayment"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Down Payment
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {((downPayment / equipmentPrice) * 100).toFixed(1)}% of
                    equipment price
                  </p>
                </div>

                {/* Trade-in Value */}
                <div style={{ marginBottom: "8px" }}>
                  <Label
                    htmlFor="tradeInValue"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Trade-in Value
                  </Label>
                  <Input
                    id="tradeInValue"
                    type="number"
                    value={tradeInValue}
                    onChange={(e) => setTradeInValue(Number(e.target.value))}
                  />
                </div>

                {/* Interest Rate */}
                <div style={{ marginBottom: "8px" }}>
                  <Label
                    htmlFor="interestRate"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Annual Interest Rate (%)
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    step="0.1"
                    min="0.1"
                  />
                </div>

                {/* Loan Term */}
                <div style={{ marginBottom: "8px" }}>
                  <Label
                    htmlFor="months"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Loan Term (months)
                  </Label>
                  <Input
                    id="months"
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    min="1"
                  />
                </div>

                {/* Initial Charges Section */}
                <div
                  style={{
                    borderTop: "1px solid #ddd",
                    paddingTop: "16px",
                    marginTop: "16px",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        marginBottom: "8px",
                      }}
                    >
                      Initial Charges
                    </h3>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      Configure initial charges and how they're applied to the
                      loan
                    </p>
                  </div>

                  <RadioGroup
                    value={showInitialCharges ? "yes" : "no"}
                    onValueChange={(value) =>
                      setShowInitialCharges(value === "yes")
                    }
                    className="mb-4"
                  >
                    <div style={{ display: "flex", gap: "32px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <RadioGroupItem
                          value="yes"
                          id="showInitialChargesYes"
                        />
                        <Label htmlFor="showInitialChargesYes">
                          Include Initial Charges
                        </Label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <RadioGroupItem value="no" id="showInitialChargesNo" />
                        <Label htmlFor="showInitialChargesNo">
                          No Initial Charges
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {showInitialCharges && (
                    <div
                      style={{
                        backgroundColor: "#f8f8f8",
                        padding: "16px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        marginTop: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <Label
                            htmlFor="serviceCharges"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            Service Charges
                          </Label>
                          <Input
                            id="serviceCharges"
                            type="number"
                            value={serviceCharges}
                            onChange={(e) =>
                              setServiceCharges(Number(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="documentCharges"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            Document Charges
                          </Label>
                          <Input
                            id="documentCharges"
                            type="number"
                            value={documentCharges}
                            onChange={(e) =>
                              setDocumentCharges(Number(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="insurancePremium"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            Insurance Premium
                          </Label>
                          <Input
                            id="insurancePremium"
                            type="number"
                            value={insurancePremium}
                            onChange={(e) =>
                              setInsurancePremium(Number(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="introducerCommission"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            Introducer Commission
                          </Label>
                          <Input
                            id="introducerCommission"
                            type="number"
                            value={introducerCommission}
                            onChange={(e) =>
                              setIntroducerCommission(Number(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="otherCharges"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            Other Charges
                          </Label>
                          <Input
                            id="otherCharges"
                            type="number"
                            value={otherCharges}
                            onChange={(e) =>
                              setOtherCharges(Number(e.target.value))
                            }
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <p style={{ fontSize: "14px", fontWeight: "500" }}>
                          Total Initial Charges:{" "}
                          {formatCurrency(
                            serviceCharges +
                              documentCharges +
                              insurancePremium +
                              introducerCommission +
                              otherCharges
                          )}
                        </p>

                        <div>
                          <Select
                            value={initialChargesOption}
                            onValueChange={setInitialChargesOption}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="capitalize">
                                Capitalize Initial Charges
                              </SelectItem>
                              <SelectItem value="separate">
                                Client Pays Separately
                              </SelectItem>
                              <SelectItem value="withdraw">
                                Withdraw from Capital
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Equipment Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {results ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Client Receiving Amount */}
                  <Card
                    style={{
                      backgroundColor: "#f0fff4",
                      border: "1px solid #c6f6d5",
                    }}
                  >
                    <CardContent style={{ padding: "16px" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#22543d",
                        }}
                      >
                        Client Will Receive
                      </p>
                      <p
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: "#276749",
                        }}
                      >
                        {formatCurrency(clientReceiving)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card style={{ backgroundColor: "#f8fafc" }}>
                    <CardContent style={{ padding: "16px" }}>
                      <p style={{ fontSize: "14px", fontWeight: "500" }}>
                        Monthly Payment
                      </p>
                      <p style={{ fontSize: "24px", fontWeight: "700" }}>
                        {formatCurrency(results.payment)}
                      </p>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Total of {results.totalPaymentPeriods} payments
                      </p>
                    </CardContent>
                  </Card>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Equipment Price
                      </p>
                      <p>{formatCurrency(equipmentPrice)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Loan Amount
                      </p>
                      <p>{formatCurrency(loanAmount)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Down Payment
                      </p>
                      <p>{formatCurrency(downPayment)}</p>
                    </div>
                    {tradeInValue > 0 && (
                      <div>
                        <p style={{ fontSize: "14px", color: "#666" }}>
                          Trade-in Value
                        </p>
                        <p>{formatCurrency(tradeInValue)}</p>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Initial Charges
                      </p>
                      <p
                        style={{
                          color:
                            getInitialChargesDisplay().color ===
                            "text-green-600"
                              ? "#059669"
                              : getInitialChargesDisplay().color ===
                                "text-red-600"
                              ? "#dc2626"
                              : "#666",
                        }}
                      >
                        {getInitialChargesDisplay().text}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Interest Rate
                      </p>
                      <p>{interestRate}% Annual</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Total Interest
                      </p>
                      <p>{formatCurrency(results.totalInterest)}</p>
                    </div>
                  </div>

                  <Card
                    style={{
                      backgroundColor: "#ebf8ff",
                      border: "1px solid #90cdf4",
                    }}
                  >
                    <CardContent style={{ padding: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#2c5282",
                            }}
                          >
                            TOTAL PAYABLE
                          </p>
                          <p style={{ fontSize: "20px", fontWeight: "700" }}>
                            {formatCurrency(results.totalPayable)}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#2c5282",
                            }}
                          >
                            Effective Rate
                          </p>
                          <p style={{ fontSize: "18px", fontWeight: "700" }}>
                            {(
                              (results.totalInterest / loanAmount) *
                              100
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div style={{ marginTop: "8px" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      Loan Details
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <div>
                        <span style={{ color: "#666" }}>
                          Payment Frequency:
                        </span>
                        <span style={{ marginLeft: "4px" }}>
                          Monthly Payments
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#666" }}>Loan Term:</span>
                        <span style={{ marginLeft: "4px" }}>
                          {months} months
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#666" }}>Equipment Amount:</span>
                        <span style={{ marginLeft: "4px" }}>
                          {formatCurrency(equipmentPrice)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#666" }}>Total Principal:</span>
                        <span style={{ marginLeft: "4px" }}>
                          {formatCurrency(results.totalPrincipal)}
                        </span>
                      </div>

                      {showInitialCharges && (
                        <div>
                          <span style={{ color: "#666" }}>
                            Initial Charges Option:
                          </span>
                          <span style={{ marginLeft: "4px" }}>
                            {initialChargesOption === "capitalize"
                              ? "Capitalize Initial Charges"
                              : initialChargesOption === "separate"
                              ? "Client Pays Separately"
                              : "Withdraw from Capital"}
                          </span>
                        </div>
                      )}

                      {showInitialCharges && (
                        <div>
                          <span style={{ color: "#666" }}>
                            Initial Charges Amount:
                          </span>
                          <span style={{ marginLeft: "4px" }}>
                            {formatCurrency(results.initialPayment)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      setShowFullAmortization(!showFullAmortization)
                    }
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      backgroundColor: "#047857",
                    }}
                  >
                    {showFullAmortization
                      ? "Hide Amortization Schedule"
                      : "Show Full Amortization Schedule"}
                  </Button>

                  <Button
                    onClick={handleApplyLoan}
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      backgroundColor: "#2563eb",
                    }}
                    disabled={(() => {
                      try {
                        const hash = params.hash;
                        const decodedHash = robustBase64Decode(hash);
                        if (!decodedHash) {
                          alert("Invalid or corrupted link. Please check your URL.");
                          return;
                        }
                        const list = decodedHash.split(",");
                        const customerId = list[2]?.split("=")[1];
                        return (
                          !customerId ||
                          customerId === "0" ||
                          customerId === null
                        );
                      } catch {
                        return true;
                      }
                    })()}
                  >
                    Apply for This Equipment Loan
                  </Button>
                </div>
              ) : (
                <p>Calculating results...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width Amortization Table at the bottom */}
      {results && showFullAmortization && (
        <div style={{ marginTop: "20px" }}>
          <Card>
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <CardTitle>Complete Amortization Schedule</CardTitle>
                <Button
                  onClick={() => setShowFullAmortization(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
              <CardDescription>
                Full payment breakdown showing principal and interest for each
                payment over the entire loan term
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    fontSize: "14px",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #ddd",
                        backgroundColor: "#f8fafc",
                        position: "sticky",
                        top: "0",
                      }}
                    >
                      <th
                        style={{
                          textAlign: "center",
                          fontWeight: "600",
                          padding: "12px",
                          backgroundColor: "#f1f5f9",
                        }}
                      >
                        Payment #
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          fontWeight: "600",
                          padding: "12px",
                          backgroundColor: "#f1f5f9",
                        }}
                      >
                        Payment Amount
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          fontWeight: "600",
                          padding: "12px",
                          backgroundColor: "#f1f5f9",
                        }}
                      >
                        Principal
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          fontWeight: "600",
                          padding: "12px",
                          backgroundColor: "#f1f5f9",
                        }}
                      >
                        Interest
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          fontWeight: "600",
                          padding: "12px",
                          backgroundColor: "#f1f5f9",
                        }}
                      >
                        Remaining Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Display the actual amortization schedule from results */}
                    {results.amortizationSchedule.map(
                      (period, index) => (
                        console.log(results),
                        (
                          <tr
                            key={period.period}
                            style={{
                              borderBottom: "1px solid #ddd",
                              backgroundColor:
                                index % 2 === 0 ? "#ffffff" : "#f8fafc",
                            }}
                          >
                            <td
                              style={{ textAlign: "center", padding: "10px" }}
                            >
                              {period.period}
                            </td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {formatCurrency(period.payment)}
                            </td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {formatCurrency(period.principal)}
                            </td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {formatCurrency(period.interest)}
                            </td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {formatCurrency(period.balance)}
                            </td>
                          </tr>
                        )
                      )
                    )}

                    {/* Summary row at the bottom */}
                    <tr
                      style={{
                        borderTop: "2px solid #ddd",
                        backgroundColor: "#e0f2fe",
                        fontWeight: "bold",
                      }}
                    >
                      <td style={{ textAlign: "center", padding: "12px" }}>
                        TOTAL
                      </td>
                      <td style={{ textAlign: "right", padding: "12px" }}>
                        {formatCurrency(
                          results.payment * results.totalPaymentPeriods
                        )}
                      </td>
                      <td style={{ textAlign: "right", padding: "12px" }}>
                        {formatCurrency(results.totalPrincipal)}
                      </td>
                      <td style={{ textAlign: "right", padding: "12px" }}>
                        {formatCurrency(results.totalInterest)}
                      </td>
                      <td style={{ textAlign: "right", padding: "12px" }}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sign-up for loan section */}
      <div
        style={{
          marginTop: "40px",
          padding: "30px 20px",
          backgroundColor: "#f0f9ff",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Ready to Move Forward?
        </h2>
        <p
          style={{
            fontSize: "16px",
            maxWidth: "600px",
            margin: "0 auto 20px auto",
          }}
        >
          Apply now to secure your equipment loan with our competitive rates and
          flexible terms.
        </p>
        <Button
          style={{
            backgroundColor: "#2563eb",
            fontSize: "16px",
            padding: "10px 24px",
          }}
        >
          Apply for Equipment Loan
        </Button>
      </div>
    </div>
  );
}
