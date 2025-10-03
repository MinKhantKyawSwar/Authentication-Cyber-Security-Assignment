import SpotlightBox from "../animated-ui/SpotLightBox";

const securityData = [
  {
    title: "Access & Refresh Tokens",
    description:
      "Short-lived access tokens verify requests, while refresh tokens securely issue new access tokens without re-login.",
  },
  {
    title: "One-Time Passwords (OTP)",
    description:
      "Temporary codes sent via SMS, email, or apps add an extra layer of authentication beyond passwords.",
  },
  {
    title: "Authentication",
    description:
      "Verifies a user’s identity using methods like passwords, biometrics, or multi-factor authentication (MFA).",
  },
  {
    title: "Hashing with Argon2",
    description:
      "A secure, modern password hashing algorithm designed to resist GPU cracking and brute-force attacks.",
  },
];

const GridSection = () => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center justify-center p-6 sm:p-10 gap-6 sm:gap-10">
      {/* Left Security Statement */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl overflow-hidden ">
        {/* Background Glow */}

        {/* Content */}
        <h1 className="relative z-10 text-3xl md:h-[60px] sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-rose-500 text-center">
          Security isn't a maybe.
        </h1>
        <p className="relative z-10 mt-4 text-base sm:text-lg md:text-lg font-medium text-neutral-700 text-center">
          It's a <span className="font-bold text-indigo-600">must</span>.
        </p>
      </div>

      {/* Right Security Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 ">
        {securityData.map((item, i) => (
          <SpotlightBox key={i}>
            <div className="p-5 sm:p-6 text-center rounded-2xl transition-transform duration-300 ">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base text-neutral-700">
                {item.description}
              </p>
            </div>
          </SpotlightBox>
        ))}
      </div>
    </div>
  );
};

export default GridSection;
