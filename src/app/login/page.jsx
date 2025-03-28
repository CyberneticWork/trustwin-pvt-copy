"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please complete all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.code === "SUCCESS") {
        localStorage.setItem("token", data.token);
        setError("");
        router.push("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Server error. Please try again.");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 to-neutral-200 p-4">
      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/images/logo.png" 
            alt="Trustwin Logo" 
            className="w-45 h-45 mb-4"
          />
          <h1 className="text-3xl font-bold text-center">
            Secure Access
          </h1>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Beautiful Error Card - No Close Button */}
          {error && (
            <div className="bg-red-50 rounded-lg shadow-md overflow-hidden mb-2 border border-red-100">
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <ShieldAlert className="text-red-600 w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-red-700">Authentication Error</h3>
                </div>
                <div className="flex items-start pl-12">
                  <p className="text-red-600">{error}</p>
                </div>
                <div className="flex items-center mt-3 pl-12 text-xs text-red-500">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span>Please check your credentials and try again</span>
                </div>
              </div>
            </div>
          )}

          {/* Username Input */}
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-blue-500 transition-colors" />
            <Input
              type="text"
              placeholder="Username"
              className="pl-12 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-blue-500 transition-colors" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-12 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full flex items-center justify-center transition-all font-bold"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </div>

        {/* Additional Links */}
        <div className="text-center mt-6">
          <a href="#" className="text-blue-600 hover:underline text-sm">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}