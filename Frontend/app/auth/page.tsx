"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function AuthPage() {
  const router = useRouter();
  const { setUser, user } = useUser();
  const { showAlert } = useAlert();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [f_name, setF_name] = useState("");
  const [l_name, setL_name] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const onboardingRequired = localStorage.getItem("onboardingRequired");
      if (onboardingRequired !== "true") {
        router.push("/dashboard");
      }
    }
  }, [loading, user, router]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!email) {
      newErrors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push("Please enter a valid email");
    }

    if (!password) {
      newErrors.push("Password is required");
    } else if (password.length < 6) {
      newErrors.push("Password must be at least 6 characters");
    }

    if (!isLogin) {
      if (!f_name) newErrors.push("First name is required");
      if (!l_name) newErrors.push("Last name is required");
    }

    if (newErrors.length > 0) {
      showAlert(newErrors.join("\n"), "destructive", "Validation Error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          }
        );
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ f_name, l_name, email, password }),
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        showAlert("Login successful!", "success");
        const user = data.data.user;
        setUser(user);
        localStorage.setItem("onboardingRequired", "true");
        if (
          user &&
          user.username &&
          user.age &&
          user.city &&
          user.phoneNumber &&
          user.gender
        ) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        showAlert(data.error || "Login failed.", "destructive");
      }
    } catch (error: any) {
      showAlert(
        error.message || "Network error. Please try again.",
        "destructive"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const email = user.email || "";
      const f_name = user.displayName?.split(" ")[0] || "";
      const l_name = user.displayName?.split(" ").slice(1).join(" ") || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/social-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ f_name, l_name, email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showAlert("Google login successful!", "success");
        const user = data.data.user;
        setUser(user);
        localStorage.setItem("onboardingRequired", "true");
        if (
          user &&
          user.username &&
          user.age &&
          user.city &&
          user.phoneNumber &&
          user.gender
        ) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        showAlert(data.error || "Google login failed.", "destructive");
      }
    } catch (error: any) {
      showAlert(
        error.message || "Google authentication failed.",
        "destructive"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">globetrotter</div>
            <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">
              BETA
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white border-4 border-black p-6 mb-6">
            <p className="text-black font-medium text-lg">
              GlobeTrotter is a new way for travel enthusiasts to connect,
              explore, and build amazing journeys together.
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-yellow-400 border-4 border-black p-4 text-center">
              <p className="text-black font-bold text-sm uppercase tracking-wide">
                PACK YOUR BAGS, EXPLORE THE WORLD!!!
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-8">
            <div className="flex mb-6">
              <button
                onClick={() => {
                  setIsLogin(true);
                }}
                className={`flex-1 py-3 text-center font-bold text-lg transition-colors ${
                  isLogin
                    ? "text-black border-b-4 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                }}
                className={`flex-1 py-3 text-center font-bold text-lg transition-colors ${
                  !isLogin
                    ? "text-black border-b-4 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                SIGN UP
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <Label
                      htmlFor="f_name"
                      className="text-black font-bold text-sm uppercase tracking-wide"
                    >
                      First Name
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="f_name"
                        type="text"
                        value={f_name}
                        onChange={(e) => setF_name(e.target.value)}
                        className="pl-4 h-14 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="l_name"
                      className="text-black font-bold text-sm uppercase tracking-wide"
                    >
                      Last Name
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="l_name"
                        type="text"
                        value={l_name}
                        onChange={(e) => setL_name(e.target.value)}
                        className="pl-4 h-14 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <Label
                  htmlFor="email"
                  className="text-black font-bold text-sm uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-14 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-black font-bold text-sm uppercase tracking-wide"
                >
                  Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-14 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? "LOADING..." : isLogin ? "LOG IN" : "CREATE ACCOUNT"}
              </Button>
            </form>

            {isLogin && (
              <div className="text-center mt-4">
                <a
                  href="#"
                  className="text-red-600 hover:text-red-700 text-sm font-bold uppercase"
                >
                  Forgot your password?
                </a>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-black font-bold uppercase">
                  OR
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleAuth}
              className="w-full h-14 bg-white hover:bg-gray-50 text-black font-bold text-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
              disabled={loading}
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              CONTINUE WITH GOOGLE
            </Button>
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <span className="text-black font-bold">T</span>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <span className="text-black font-bold">I</span>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <span className="text-black font-bold">L</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
