import { motion } from "framer-motion";

interface MotionHeadingProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "left" | "right" | "top" | "bottom"; 
}

export default function MotionHeading({ 
    children, 
    className = "", 
    delay = 0, 
    direction = "top" 
}: MotionHeadingProps) {
    
    const variants = {
        left: { opacity: 0, x: -50 },
        right: { opacity: 0, x: 50 },
        top: { opacity: 0, y: -20 },
        bottom: { opacity: 0, y: 20 },
    };

    return (
        <motion.h1
            className={`text-4xl font-bold font-bevnpro ${className}`}
            initial={variants[direction]}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay }}
            viewport={{ once: false, amount: 0.2 }}
        >
            {children}
        </motion.h1>
    );
}
