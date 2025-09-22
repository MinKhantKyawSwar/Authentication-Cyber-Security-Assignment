import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { SidebarProps } from "@/types";

const menuItems = [
  { label: "Home", icon: "fluent-color:home-20", path: "/" },
  { label: "Profile", icon: "fluent-color:patient-32", path: "/profile" },
  { label: "Settings", icon: "fluent-color:settings-48", path: "/settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay background */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-20 left-0 h-fit py-5 w-64 z-20 bg-[#25252A] text-white rounded-tr-xl rounded-br-xl shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Menu List</h2>
        </div>

        <nav className="mt-4 flex flex-col space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 ml-3 px-4 py-3 rounded-tl rounded-bl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-[#A161E0] to-[#6B3D99] text-white shadow-md"
                  : "hover:bg-gray-800"
              }`}
              onClick={onClose}
            >
              <Icon
                icon={item.icon}
                width="30"
                height="30"
                className="bg-[#51405E] backdrop-blur-md rounded p-1 text-white"
              />

              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
