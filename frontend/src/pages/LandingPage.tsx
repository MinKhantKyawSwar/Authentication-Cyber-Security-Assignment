import Header from "@/components/Header";
import LandingSection from "@/components/home/LandingSection";

const LandingPage = () => {
  return (
    <>
      <Header />
      <div className="space-x-5 space-y-4 flex justify-center">
        <LandingSection />
      </div>
    </>
  );
};

export default LandingPage;
