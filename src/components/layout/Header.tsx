
"use client";

import Link from 'next/link';
import { CookingPot, LogIn, LogOut, User, BookHeart, Sparkles } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';


export default function Header() {
  const { isAuthenticated, logout, isLoading, currentUser } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <CookingPot size={32} />
          <h1 className="text-2xl font-headline font-bold">Recipe Snap</h1>
        </Link>
        <nav className="flex items-center gap-4">
          {isLoading ? (
             <Skeleton className="h-10 w-28" />
          ) : isAuthenticated && currentUser ? (
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <User size={24} className="text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Hi, {currentUser}!</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Welcome to Recipe Snap
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
