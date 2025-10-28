import React from 'react';

interface LogoutModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, setIsOpen, onLogout }) => {
    
    const handleLogout = () => {
        onLogout();
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.9) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0px); opacity: 1; }
                }
            `}</style>
            
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                {/* Backdrop */}
                <div
                    onClick={handleClose}
                    className="bg-black/20 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    {/* Modal Content */}
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-xl w-full max-w-sm shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        <div className="p-8 text-center">
                            <img 
                                src="/images/Logo.png" 
                                alt="UIC MediCare Logo" 
                                className="w-24 h-24 mx-auto mb-6"
                            />
                            
                            <h2 className="text-xl font-bold text-red-600 mb-2">
                                CAUTION!
                            </h2>
                            
                            <p className="text-gray-700 mb-8">
                                Are you sure you want to log out?
                            </p>
                            
                            <div className="flex justify-center items-center space-x-4">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LogoutModal;