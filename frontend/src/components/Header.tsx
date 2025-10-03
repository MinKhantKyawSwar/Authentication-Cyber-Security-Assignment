import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";
import { GamingButton } from "./ui/gaming-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectCurrentUser,
  selectCurrentToken,
} from "@/features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
// import toast from "react-hot-toast";

const Header: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="px-4 h-16 flex items-center justify-between mx-5">
          {/* Left side */}
          <div className="flex justify-between items-center space-x-4 sm:space-x-10">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold">Authentic</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Theme Toggle & Notifications */}
            {/* <div className="flex gap-2 sm:gap-4">
              <GamingButton
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <FiSun className="h-5 w-5 text-white hover:scale-105 transition-transform duration-200" />
                ) : (
                  <FiMoon className="h-5 w-5 text-white hover:scale-105 transition-transform duration-200" />
                )}
              </GamingButton>
            </div> */}

            {/* User Profile Dropdown */}
            {user && token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-1 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                    <Avatar className="h-10 w-10 border-2 border-neutral-700 rounded-full overflow-hidden">
                      {/* If user has profile image, show it; otherwise fallback */}
                      {
                        <AvatarFallback className="bg-neutral-300 text-black flex items-center justify-center">
                          {(user.name || user.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      }
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">
                        {user.name || user.email}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel className="text-xs">
                    Signed in as {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-red-100 focus:bg-red-100"
                  >
                    <div className="flex items-center gap-2 text-red-500">
                      <Icon icon="hugeicons:logout-02" className="h-5 w-5" />
                      <span>Logout</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="text-white font-semibold hover:underline transition-colors duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
