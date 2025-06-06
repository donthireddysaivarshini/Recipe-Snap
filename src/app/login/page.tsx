
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { CookingPot, LogIn } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }
    const result = await login(username, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.message || 'Login failed. Please check your credentials.');
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.message || 'Please check your credentials.',
      });
    } else {
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
      // Navigation is handled by AuthContext's login method
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background to-secondary/30">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CookingPot size={48} className="mx-auto mb-4 text-primary" />
            <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue to Recipe Snap.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="your_username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? 'Signing In...' : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
