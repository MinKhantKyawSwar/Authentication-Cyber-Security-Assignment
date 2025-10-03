const WhySection = () => {
  return (
    <div className="mb-20 w-full px-4 sm:px-6">
      {/* Why Cybersecurity Matters */}
      <div className="flex flex-col items-center gap-6 sm:gap-10 text-center mt-16 sm:mt-32">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-rose-500 leading-snug">
          Why Cybersecurity Matters
        </h2>
        <p className="max-w-xl sm:max-w-3xl text-neutral-500 text-base sm:text-lg md:text-xl leading-relaxed">
          In today’s digital world, protecting your data is not optional. From
          personal information to corporate secrets, cybersecurity ensures your
          privacy, trust, and safety online.
        </p>

        {/* Key Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 mt-6 sm:mt-10 w-full">
          <div className="p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 bg-white">
            <h3 className="font-bold text-lg sm:text-xl mb-2 text-indigo-600">
              Data Protection
            </h3>
            <p className="text-neutral-700 text-sm sm:text-base">
              Keep sensitive information safe from unauthorized access and
              breaches.
            </p>
          </div>
          <div className="p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 bg-white">
            <h3 className="font-bold text-lg sm:text-xl mb-2 text-pink-500">
              User Trust
            </h3>
            <p className="text-neutral-700 text-sm sm:text-base">
              Maintain your users’ confidence by securing accounts and personal
              data.
            </p>
          </div>
          <div className="p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 bg-white">
            <h3 className="font-bold text-lg sm:text-xl mb-2 text-rose-500">
              Compliance
            </h3>
            <p className="text-neutral-700 text-sm sm:text-base">
              Stay compliant with privacy laws and industry regulations for
              online security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhySection;
