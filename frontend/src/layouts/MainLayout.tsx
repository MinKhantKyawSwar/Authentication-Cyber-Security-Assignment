import React from "react";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import { useAppSelector } from "../hooks/useAppSelector";
import { LoginPage } from "@/pages";
import LandingPage from "@/pages/LandingPage";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    // return <LoginPage />;
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      <main className="container mx-auto md:px-2 px-5 py-6">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
