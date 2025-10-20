'use client';

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { username, password: password.replace(/./g, '*') }); // For debugging - masking password
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      console.log("Login response status:", response.status);
      console.log("Login response:", data); // For debugging
      
      if (!response.ok) {
        throw new Error(data.error || `Login failed with status ${response.status}`);
      }
      
      if (!data.user) {
        throw new Error("No user data returned from server");
      }
      
      // Save user to localStorage for client-side auth
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast({
        title: "Success",
        description: "You have been logged in successfully!",
      });
      
      // Redirect based on user role
      if (data.user.role === 'organizer') {
        router.push("/event/organizer");
      } else if (data.user.role === 'team') {
        router.push("/event/dashboard");
      } else {
        router.push("/event/dashboard");
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-secondary/30 glass-navbar-enhanced">
      <CardHeader className="space-y-1 py-8">
        <CardDescription className="text-center text-base">
          Enter your credentials to access the event
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-6 py-6">
          <div className="space-y-3">
            <label htmlFor="username" className="text-sm font-medium leading-none">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="border-secondary/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Link 
                href="#" 
                className="text-xs text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="border-secondary/50 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-5 py-8">
          <Button 
            type="submit" 
            className="w-full animated-border-button h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link 
              href="/" 
              className="text-primary underline-offset-4 hover:underline"
            >
              Go back to home
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}