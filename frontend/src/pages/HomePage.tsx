import React from "react";
import MainLayout from "../layouts/MainLayout";
import Home from "@/components/home/Home";
const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <MainLayout>
        <Home />
      </MainLayout>
    </div>
  );
};

export default HomePage;
