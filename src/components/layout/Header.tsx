
"use client";

import Link from 'next/link';
import { CookingPot, LogIn, LogOut, UserCircle, BookHeart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <CookingPot size={32} />
          <h1 className="text-2xl font-headline font-bold">Recipe Snap</h1>
        </Link>
        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
          ) : isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/app/generator" className="flex items-center gap-1">
                  <Sparkles size={18} /> New Recipe
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/app/saved-recipes" className="flex items-center gap-1">
                  <BookHeart size={18} /> Saved
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                      <AvatarFallback>YN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Your Name</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        your.email@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/login" className="flex items-center gap-1">
                <LogIn size={18} /> Login / Sign Up
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
