import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoWarningOutline, IoCloseOutline, IoTrashOutline, IoLogOutOutline } from 'react-icons/io5';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // "danger" | "warning" | "info"
    icon = null
}) => {
    // Define colors and default icons based on type
    let colorClasses = "bg-primary text-white hover:bg-primary/90";
    let iconElement = icon || <IoWarningOutline className="w-6 h-6 text-primary" />;
    let iconBgClass = "bg-primary/10";

    if (type === "danger") {
        colorClasses = "bg-error text-white hover:bg-error/90";
        iconElement = icon || <IoTrashOutline className="w-6 h-6 text-error" />;
        iconBgClass = "bg-error/10";
    } else if (type === "warning") {
        colorClasses = "bg-amber-500 text-white hover:bg-amber-600";
        iconElement = icon || <IoLogOutOutline className="w-6 h-6 text-amber-500" />;
        iconBgClass = "bg-amber-500/10";
    }

    // Use a portal so the modal always renders at document.body level.
    // This ensures `fixed inset-0` covers the true full viewport even when
    // the component is nested inside a `fixed`-positioned parent (e.g. DesktopNav).
    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 botanical-shadow overflow-hidden flex flex-col z-10 border border-white"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant"
                        >
                            <IoCloseOutline className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4 mb-8 pt-4">
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-2 ${iconBgClass}`}>
                                {iconElement}
                            </div>
                            <h3 className="text-2xl font-headline font-black text-on-surface">
                                {title}
                            </h3>
                            <p className="text-on-surface-variant font-medium opacity-80 text-sm max-w-[280px]">
                                {message}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg ${colorClasses}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmationModal;
