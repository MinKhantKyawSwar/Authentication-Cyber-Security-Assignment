import React from "react";
import MainLayout from "../layouts/MainLayout";
import { FloatingParticles, FloatingElements } from "@/components";

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <MainLayout>
        <div className="h-screen">Hello World!</div>
      </MainLayout>
    </div>
  );
};

export default HomePage;
