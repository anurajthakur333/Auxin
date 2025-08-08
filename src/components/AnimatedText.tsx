import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedText = ({ 
  text, 
  delay = 0, 
  duration = 0.6, 
  className = "",
  style = {}
}: AnimatedTextProps) => {
  return (
    <motion.h1
      className={className}
      style={style}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {text}
    </motion.h1>
  );
};
