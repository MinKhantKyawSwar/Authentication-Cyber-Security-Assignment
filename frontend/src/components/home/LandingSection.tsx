import React from "react";

const LandingSection = () => {
  return (
    <div className="px-10 py-4 flex flex-col items-center justify-center">
      <span className="text-3xl font-semibold pt-20">Nice to meet you! </span>
      <span className="w-1/2 text-center mt-10">
        This website is created for the advanced cyber security assignment. In
        order to explore access token, refresh token, authentication with OTP
        and hashing password. Please Login with your gmail or google account in
        order to check information.
      </span>
      <span className="font-bold mt-4">Thank you!</span>
    </div>
  );
};

export default LandingSection;
