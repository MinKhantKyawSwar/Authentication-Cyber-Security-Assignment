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
import { logout, selectCurrentUser, selectCurrentToken } from "@/features/auth/authSlice";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="sticky top-0 z-50 w-full glass border-b-[#B366FF] border-b-4">
        <div className="px-4 h-16 flex items-center justify-between mx-5">
          {/* Left side */}
          <div className="flex justify-between items-center space-x-4 sm:space-x-10">
            <Icon
              icon="mingcute:menu-fill"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="h-6 w-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200"
            />

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-gaming rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-lg sm:text-xl font-bold gradient-text">
                Authentic
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Theme Toggle & Notifications */}
            <div className="flex gap-2 sm:gap-4">
              <GamingButton
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <FiSun className="h-5 w-5 text-white hover:scale-105 transition-transform duration-200" />
                ) : (
                  <FiMoon className="h-5 w-5 text-white hover:scale-105 transition-transform duration-200" />
                )}
              </GamingButton>

              <GamingButton variant="ghost" size="icon" className="relative">
                <Icon
                  icon="ion:notifications"
                  className="h-5 w-5 text-white hover:scale-105 transition-transform duration-200"
                />
                <Badge className="absolute -top-0 -right-0 h-5 w-5 flex items-center justify-center p-0 bg-[#F94D4D] text-accent-foreground text-xs">
                  3
                </Badge>
              </GamingButton>
            </div>

            {/* User Profile Dropdown */}
            {user && token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-gaming text-white">
                        {(user.name || user.email).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel className="text-xs">
                    Signed in as {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex gap-2">
                      <Icon icon="gg:profile" className="h-5 w-5 text-white" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <div className="flex gap-2 text-red-500">
                      <Icon icon="hugeicons:logout-02" className="h-5 w-5 " />
                      <span>Logout</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="text-white font-semibold hover:underline"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
