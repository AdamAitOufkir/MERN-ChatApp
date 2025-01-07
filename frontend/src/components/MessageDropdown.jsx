import { Forward, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MessageDropdown = ({ isOpen, onTransfer, onDelete }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="absolute right-0 top-0 mt-8 w-48 rounded-lg shadow-lg bg-base-200 border border-base-300 overflow-hidden z-50"
        >
          <button
            onClick={onTransfer}
            className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-base-300 transition-colors text-left"
          >
            <Forward className="size-4" />
            <span>Transfer message</span>
          </button>
          <button
            onClick={onDelete}
            className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-base-300 transition-colors text-left text-error"
          >
            <Trash2 className="size-4" />
            <span>Delete message</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageDropdown;
