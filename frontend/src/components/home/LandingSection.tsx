import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import React from "react";
import GridSection from "./GridSection";
import WhySection from "./WhySection";

const LandingSection = () => {
  const gridSectionRef = React.useRef(null);
  const whySectionRef = React.useRef(null);

  const scrollToSection = () => {
    gridSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToWhy = () => {
    whySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex flex-col w-full max-w-full px-4 sm:px-6 md:px-8 mx-auto gap-10 items-center justify-center">
      {/* Hero Section */}
      <div className="relative w-full flex mt-16 flex-col items-center justify-center mb-20 sm:mb-32 overflow-visible">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-pink-700/20 to-transparent blur-3xl w-full rounded-full -z-10 animate-[pulse_10s_ease-in-out_infinite]" />

        {/* Title & Subtitle */}
        <div className="flex flex-col justify-center items-center mt-20 text-center">
          <h1 className="font-extrabold text-transparent h-20 bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-rose-500 text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-snug sm:leading-normal md:leading-[1.2]">
            Protecting a Web Application
          </h1>
          <p className="text-sm sm:text-base md:text-lg mt-4 md:mt-6 max-w-xl md:max-w-2xl text-neutral-400 leading-relaxed">
            This website is created for the advanced cyber security assignment.
            It includes access tokens, refresh tokens, password encryption and
            hashing, OTP authentication, and Google login. By logging in, you’ll
            be able to see all the information about it.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 md:mt-10 w-full sm:w-auto">
          <Link
            to="/sign-up"
            className="w-full sm:w-auto rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-pink-500 shadow-md transition-all duration-300 text-center"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto rounded-lg px-6 py-3 font-semibold text-black bg-white border  hover:shadow-md transition-all duration-300 text-center"
          >
            Login
          </Link>
        </div>

        {/* Scroll Chevron */}
        <button
          onClick={scrollToSection}
          className="flex items-center justify-center w-full mt-10 md:mt-16 animate-bounce opacity-70 hover:opacity-100 transition-opacity duration-900"
        >
          <ChevronDown className="w-7 h-7 text-neutral-400 hover:text-white transition-colors" />
        </button>
      </div>

      {/* Security Grid Section */}
      <div ref={gridSectionRef} className="w-full relative md:pt-40">
        <GridSection />
        <button
          onClick={scrollToWhy}
          className="flex items-center justify-center w-full animate-bounce opacity-70 hover:opacity-100 transition-opacity duration-900"
        >
          <ChevronDown className="w-7 h-7 text-neutral-400 hover:text-white transition-colors" />
        </button>
      </div>

      {/* Why Section */}
      <div
        ref={whySectionRef}
        className="w-full py-16 md:py-20 flex flex-col items-center gap-10 rounded-3xl"
      >
        <WhySection />
      </div>
    </div>
  );
};

export default LandingSection;
