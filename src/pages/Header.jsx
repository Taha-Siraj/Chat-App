import React, { useContext, useEffect, useState, useRef } from 'react';
import { GlobalContext } from './Context/Context';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { toast, Toaster } from 'sonner';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaHome, FaComments } from 'react-icons/fa';

const Header = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for profile dropdown
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    const dropdownRef = useRef(null); 
    const [userPhotoURL, setUserPhotoURL] = useState(
        state.user?.photoURL || localStorage.getItem("photoURL") || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user?.uid || 'default'}`
    );
    const [userDisplayName, setUserDisplayName] = useState(
        state.user?.displayName || localStorage.getItem("displayName") || "Anonymous User"
    );
    const [userEmail, setUserEmail] = useState(
        state.user?.email || localStorage.getItem("email") || "No email provided"
    );

    const db = getFirestore(); // Initialize Firestore

    // Effect to update user info from context or Firestore
    useEffect(() => {
        const fetchAndSetUserData = async () => {
            if (state.user?.uid) {
                // Prioritize data from state.user
                setUserPhotoURL(state.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user.uid}`);
                setUserDisplayName(state.user.displayName || "Anonymous User");
                setUserEmail(state.user.email || "No email provided");

                // Also store in localStorage for persistence across sessions (if not using global state for initial load)
                localStorage.setItem("photoURL", state.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user.uid}`);
                localStorage.setItem("displayName", state.user.displayName || "Anonymous User");
                localStorage.setItem("email", state.user.email || "No email provided");

                
            } else {
               
                localStorage.removeItem("photoURL");
                localStorage.removeItem("displayName");
                localStorage.removeItem("email");
                setUserPhotoURL(`https://api.dicebear.com/7.x/pixel-art/svg?seed=default`);
                setUserDisplayName("Guest User");
                setUserEmail("Not logged in");
            }
        };

        fetchAndSetUserData();
    }, [state.user, db]); 
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

 
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            localStorage.clear(); 
            dispatch({ type: 'USER_LOGOUT' });
            toast.success("You have been logged out successfully!", { duration: 2000 });
            navigate("/"); 
            setIsDropdownOpen(false); 
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to log out. Please try again.", { duration: 3000 });
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    return (
        <header className='fixed top-0 left-0 w-full bg-gray-900 text-white shadow-lg z-50 font-poppins'>
            <Toaster position="top-center" richColors closeButton />

            <nav className='container mx-auto h-[70px] flex items-center justify-between px-4 md:px-8'>
                {/* Logo/Brand */}
                <Link to="/" className='text-3xl md:text-4xl font-extrabold text-indigo-500 tracking-tight hover:text-indigo-400 transition-colors duration-200'>
                    Chat<span className='text-white'>App</span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className='hidden lg:flex items-center space-x-8'>
                    <Link to="/" className='text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2'>
                        <FaHome /> Home
                    </Link>
                    {state.user ? (
                        <Link to="/userlist" className='text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2'>
                            <FaComments /> Chat
                        </Link>
                    ) : (
                        <Link to="/login" className='text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200'>
                            Login
                        </Link>
                    )}
                </div>

                {/* User Avatar & Dropdown / Mobile Menu Toggle */}
                <div className='flex items-center gap-4'>
                    {state.user ? (
                        <div className="relative" ref={dropdownRef}>
                            <img
                                src={userPhotoURL}
                                alt={userDisplayName}
                                className='h-12 w-12 rounded-full object-cover border-2 border-indigo-500 cursor-pointer hover:border-indigo-400 active:scale-95 transition-all duration-200 shadow-md'
                                onClick={toggleDropdown}
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            />
                            {isDropdownOpen && (
                                <div className='absolute right-0 mt-3 w-64 bg-gray-800 rounded-lg shadow-xl py-4 animate-fade-in-down origin-top-right border border-gray-700'>
                                    <div className="flex flex-col items-center p-4 border-b border-gray-700 mb-3">
                                        <img src={userPhotoURL} alt="Profile" className='h-20 w-20 rounded-full object-cover mb-3 border-2 border-indigo-500' />
                                        <h3 className="text-xl font-semibold text-white truncate max-w-[calc(100%-10px)]">{userDisplayName}</h3>
                                        <p className="text-sm text-gray-400 truncate max-w-[calc(100%-10px)]">{userEmail}</p>
                                    </div>
                                    <Link
                                        to="/userprofile"
                                        onClick={() => { setIsDropdownOpen(false); navigate('/userprofile'); }}
                                        className="px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center gap-3"
                                    >
                                        <FaUserCircle className="text-lg" /> View Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200 flex items-center gap-3 mt-2"
                                    >
                                        <FaSignOutAlt className="text-lg" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className='hidden lg:block bg-indigo-600 text-white py-2 px-5 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md'>
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle (Hamburger) */}
                    <button
                        className='lg:hidden text-gray-300 hover:text-white transition-colors duration-200 text-2xl focus:outline-none'
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Menu (Overlay) */}
            {isMobileMenuOpen && (
                <div className='lg:hidden fixed inset-0 bg-gray-950 bg-opacity-95 z-40 flex flex-col items-center justify-center animate-fade-in-left'>
                    <button
                        className='absolute top-4 right-4 text-gray-300 hover:text-white transition-colors duration-200 text-3xl'
                        onClick={toggleMobileMenu}
                        aria-label="Close navigation menu"
                    >
                        <FaTimes />
                    </button>
                    <nav className='flex flex-col items-center gap-8 text-2xl font-semibold'>
                        <Link
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className='text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-3'
                        >
                            <FaHome /> Home
                        </Link>
                        {state.user ? (
                            <Link
                                to="/userlist"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className='text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-3'
                            >
                                <FaComments /> Chat
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className='text-gray-300 hover:text-white transition-colors duration-200'
                            >
                                Login
                            </Link>
                        )}
                        {state.user && (
                            <>
                                <Link
                                    to="/userprofile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-3'
                                >
                                    <FaUserCircle /> Profile
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className='text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center gap-3'
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            )}

            {/* Tailwind CSS Custom Animations (add to tailwind.config.js) */}
            <style>{`
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in-left {
                    from {
                        opacity: 0;
                        transform: translateX(-100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.3s ease-out forwards;
                }
            `}</style>
        </header>
    );
};

export default Header;