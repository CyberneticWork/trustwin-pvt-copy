"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, AlertCircle, ShieldCheck } from "lucide-react";
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
      // Validate and get token
      const response = await fetch("/api/account/validate-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || data.code !== "SUCCESS") {
        setError(data.error || "Login failed");
        return;
      }

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to home
      setError("");
      router.push("/");
    } catch (error) {
      setError("Server error. Please try again.");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Space-like animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900"
          style={{
            animation: "colorShift 20s infinite alternate ease-in-out",
          }}
        ></div>
        
        {/* Twinkling stars */}
        <div className="absolute inset-0 z-1">
          <div className="stars-small"></div>
          <div className="stars-medium"></div>
          <div className="stars-large"></div>
        </div>
        
        {/* Nebula effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/20"
          style={{ 
            animation: "nebulaMove 30s infinite alternate ease-in-out",
            mixBlendMode: "screen"
          }}
        ></div>
      </div>

      <div className="w-full max-w-md z-10 relative">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {/* Header Area */}
          <div className="bg-gray-50/90 px-6 py-8 flex flex-col items-center border-b border-gray-100">
            {/* Logo without circle */}
            <div className="mb-4">
              <img 
                src="/images/logo.png" 
                alt="Trustwin Logo" 
                className="w-[153%] h-[153%] object-contain max-w-[180px]"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="inline-block w-4 h-4 mr-2" />
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="inline-block w-4 h-4 mr-2" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <span className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Sign in securely
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Additional text */}
        <p className="text-center mt-6 text-sm text-white">
          Don't have an account? Contact your administrator
        </p>
      </div>

      {/* Global styles for the space animation */}
      <style jsx global>{`
        @keyframes colorShift {
          0% { background-image: linear-gradient(to right, #090f1f, #111827, #1e1b4b); }
          20% { background-image: linear-gradient(to right, #111827, #1e1b4b, #0f172a); }
          40% { background-image: linear-gradient(to right, #1e1b4b, #0f172a, #161638); }
          60% { background-image: linear-gradient(to right, #0f172a, #161638, #15162c); }
          80% { background-image: linear-gradient(to right, #161638, #15162c, #090f1f); }
          100% { background-image: linear-gradient(to right, #15162c, #090f1f, #111827); }
        }
        
        @keyframes nebulaMove {
          0% { transform: scale(1) translate(0, 0); opacity: 0.4; }
          50% { transform: scale(1.2) translate(-5%, 2%); opacity: 0.6; }
          100% { transform: scale(1) translate(2%, -5%); opacity: 0.4; }
        }
        
        /* Stars animation */
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        
        .stars-small, .stars-medium, .stars-large {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-repeat: repeat;
          background-position: center;
        }
        
        .stars-small {
          background-image: radial-gradient(1px 1px at calc(100% * var(--x-1)) calc(100% * var(--y-1)), white, transparent),
                           radial-gradient(1px 1px at calc(100% * var(--x-2)) calc(100% * var(--y-2)), white, transparent),
                           radial-gradient(2px 2px at calc(100% * var(--x-3)) calc(100% * var(--y-3)), white, transparent),
                           radial-gradient(1px 1px at calc(100% * var(--x-4)) calc(100% * var(--y-4)), white, transparent),
                           radial-gradient(1px 1px at calc(100% * var(--x-5)) calc(100% * var(--y-5)), white, transparent);
          background-size: 200px 200px;
          animation: twinkle 4s infinite alternate;
          --x-1: 0.1;
          --y-1: 0.3;
          --x-2: 0.5;
          --y-2: 0.7;
          --x-3: 0.9;
          --y-3: 0.2;
          --x-4: 0.3;
          --y-4: 0.8;
          --x-5: 0.6;
          --y-5: 0.4;
        }
        
        .stars-medium {
          background-image: radial-gradient(1.5px 1.5px at calc(100% * var(--x-1)) calc(100% * var(--y-1)), white, transparent),
                           radial-gradient(1.5px 1.5px at calc(100% * var(--x-2)) calc(100% * var(--y-2)), white, transparent),
                           radial-gradient(1.5px 1.5px at calc(100% * var(--x-3)) calc(100% * var(--y-3)), white, transparent);
          background-size: 300px 300px;
          animation: twinkle 5s infinite alternate-reverse;
          --x-1: 0.2;
          --y-1: 0.4;
          --x-2: 0.7;
          --y-2: 0.3;
          --x-3: 0.4;
          --y-3: 0.8;
        }
        
        .stars-large {
          background-image: radial-gradient(2px 2px at calc(100% * var(--x-1)) calc(100% * var(--y-1)), white, transparent),
                           radial-gradient(2px 2px at calc(100% * var(--x-2)) calc(100% * var(--y-2)), white, transparent);
          background-size: 400px 400px;
          animation: twinkle 7s infinite alternate;
          --x-1: 0.3;
          --y-1: 0.5;
          --x-2: 0.8;
          --y-2: 0.2;
        }
      `}</style>
    </div>
  );
}
