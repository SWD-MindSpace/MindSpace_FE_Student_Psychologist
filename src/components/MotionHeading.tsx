import { motion } from "framer-motion";

interface MotionHeadingProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function MotionHeading({ children, className = "", delay = 0 }: MotionHeadingProps) {
    return (
        <motion.h1
            className={`text-4xl font-bold font-bevnpro ${className}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay }}
            viewport={{ once: false, amount: 0.2 }}
        >
            {children}
        </motion.h1>
    );
}