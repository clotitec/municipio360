"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function GlassModal({ open, onClose, children, title }: GlassModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl backdrop-blur-xl bg-white/90 border-t border-white/30 shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              {title && <h2 className="text-lg font-semibold text-gray-900 mt-2">{title}</h2>}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100/60 transition-colors ml-auto"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
