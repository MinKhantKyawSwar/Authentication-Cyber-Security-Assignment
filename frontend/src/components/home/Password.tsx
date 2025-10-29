import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const Password = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="p-[1px]  border border-white h-full"
    >
      <div className=" p-6 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-[#3a2e2e] text-[#ffb347]">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Secure Password</h2>
          <p className="text-gray-400 mt-1">
            Password is hashed and salted with{" "}
            <span className="text-yellow-300">Argon2</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Password;
