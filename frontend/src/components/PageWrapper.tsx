import { motion } from 'framer-motion';

export const PageWrapper = ({ children, bg = "bg-[#F8F9FA]" }: { children: React.ReactNode, bg?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className={`w-full min-h-screen ${bg}`}
  >
    {children}
  </motion.div>
);
