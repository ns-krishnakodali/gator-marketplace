import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Simulate API request for authentication
    const isValid = email === "user@example.com" && password === "password123";
    
    if (!isValid) {
      setError("Incorrect email or password. Please try again.");
      return;
    }

    console.log("Logged in successfully");
    // Proceed with navigation or authentication state handling
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 p-6 shadow-lg">
      <CardHeader className="text-xl font-semibold text-center">Login</CardHeader>
      <CardContent>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
            <label className="ml-2 text-sm">Remember Me</label>
          </div>
          <Link to="/reset-password" className="text-blue-500 text-sm">Forgot password?</Link>
        </div>
        <Button className="w-full" onClick={handleLogin}>Login</Button>
        <p className="text-sm text-center mt-4">
          Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
