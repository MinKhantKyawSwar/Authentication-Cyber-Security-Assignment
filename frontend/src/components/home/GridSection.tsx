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
      "Verifies a user’s identity using various methods such as passwords, biometrics, or  (MFA) to ensure secure access.",
  },
  {
    title: "Hashing with Argon2",
    description:
      "Implements a modern password hashing algorithm, designed to resist brute-force attacks, ensuring sensitive user credentials remain protected.",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 ">
        {securityData.map((item, i) => {
          const borderRight = i % 2 === 0 ? "sm:border-r" : "";
          const borderBottom = i < 2 ? "sm:border-b" : "";
          return (
            <div
              key={i}
              className={`p-5 sm:p-6 text-center transition-transform duration-300 ${borderRight} ${borderBottom}`}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base text-neutral-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GridSection;
