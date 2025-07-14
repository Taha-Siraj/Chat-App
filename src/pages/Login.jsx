import React, { useState, useContext, useEffect } from 'react';
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions
import { toast, Toaster } from 'sonner'; // Using Sonner for premium toasts
import { ClipLoader } from 'react-spinners';
import { GlobalContext } from './Context/Context';

const Login = () => {
    const [passwordShown, setPasswordShown] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // For email/password login
    const [googleLoading, setGoogleLoading] = useState(false); // For Google login
    const navigate = useNavigate();
    const { dispatch } = useContext(GlobalContext); // Only need dispatch here

    const db = getFirestore(); // Initialize Firestore for user document creation on Google login

    // This useEffect is mostly for debugging. You can remove it for production.
    useEffect(() => {
        // console.log("Login component state:", state);
    }, [email, password, loading, googleLoading]); // More precise dependencies

    // Handle Email/Password Login
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.warning('Please fill in both email and password.', { duration: 2000 });
            return;
        }

        setLoading(true);
        const auth = getAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Optional: Ensure user's Firestore document exists/is updated on login
            // This is good for keeping displayName, photoURL, and online status consistent
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                userName: user.displayName || user.email, // Use display name if available
                photoURL: user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
                email: user.email,
                status: "online",
                lastSeen: serverTimestamp(),
            }, { merge: true }); // Merge ensures it updates existing or creates new

            dispatch({ type: 'USER_LOGIN', payload: user });
            toast.success(`Welcome back, ${user.displayName || user.email.split('@')[0]}!`, { duration: 2000 });
            navigate("/userlist"); // Navigate to chat user list
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            let errorMessage = "Login failed. Please check your credentials.";
            if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many login attempts. Please try again later.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage, { duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Handle Forgot Password
    const handleForgotPassword = async () => {
        if (!email.trim()) {
            toast.info('Please enter your email address to reset your password.', { duration: 3000 });
            return;
        }

        const auth = getAuth();
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success(`Password reset email sent to ${email}. Please check your inbox!`, { duration: 5000 });
        } catch (error) {
            console.error("Password Reset Error:", error.code, error.message);
            let errorMessage = "Failed to send reset email.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No user found with that email address.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage, { duration: 3000 });
        }
    };

    // Handle Google Sign-In
    const signInWithGoogle = async () => {
        setGoogleLoading(true);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Ensure user's Firestore document exists/is updated on Google login
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                userName: user.displayName || user.email,
                photoURL: user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
                email: user.email,
                status: "online",
                lastSeen: serverTimestamp(),
                createdAt: serverTimestamp(), // Record creation time for new users
            }, { merge: true });

            dispatch({ type: 'USER_LOGIN', payload: user });
            toast.success(`Successfully signed in with Google!`, { duration: 2000 });
            navigate("/userlist"); // Navigate to chat user list
        } catch (error) {
            console.error("Google Sign-In Error:", error.code, error.message);
            let errorMessage = "Google sign-in failed. Please try again.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Google sign-in popup was closed.";
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = "Google sign-in request cancelled or already pending.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage, { duration: 3000 });
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-poppins px-4 py-8 relative overflow-hidden">
            {/* Using Sonner for toasts */}
            <Toaster position="top-center" richColors closeButton />

            {/* Background elements for visual interest */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-full h-full bg-cover bg-center animate-pulse-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510915228385-d85353fdf087?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}></div>
            </div>
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div> {/* Dark overlay */}

            <div className="relative z-20 w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transform transition-all duration-300 animate-fade-in-up-card">
                <h1 className="text-4xl font-extrabold text-center text-indigo-400 mb-8 animate-fade-in-up">
                    Welcome Back!
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                            placeholder="e.g., yourname@example.com"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type={passwordShown ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200 pr-12"
                            placeholder="••••••••"
                            required
                        />
                        <span
                            className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400 hover:text-white transition-colors top-8"
                            onClick={() => setPasswordShown(prev => !prev)}
                            aria-label={passwordShown ? "Hide password" : "Show password"}
                        >
                            {passwordShown ? <BiSolidShow className="text-xl" /> : <BiSolidHide className="text-xl" />}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">Remember me</label>
                        </div>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm font-medium text-indigo-400 hover:underline hover:text-indigo-300 transition-colors duration-200"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && <ClipLoader size={20} color="#fff" />}
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400 my-6">
                    OR
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full py-3 px-5 bg-white text-gray-800 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-3"
                    disabled={googleLoading}
                >
                    {googleLoading && <ClipLoader size={20} color="#333" />}
                    <FcGoogle className="text-2xl" />
                    {googleLoading ? 'Signing In...' : 'Sign in with Google'}
                </button>

                <p className="text-sm text-gray-400 text-center mt-6">
                    Don’t have an account yet?{' '}
                    <Link to="/signup" className="font-medium text-indigo-400 hover:underline hover:text-indigo-300 transition-colors duration-200">
                        Sign up
                    </Link>
                </p>
            </div>

            {/* Tailwind CSS Custom Animations (add to tailwind.config.js) */}
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in-up-card {
                    from {
                        opacity: 0;
                        transform: translateY(50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes pulse-bg {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                .animate-fade-in-up-card {
                    animation: fade-in-up-card 0.7s ease-out forwards;
                }
                .animate-pulse-bg {
                    animation: pulse-bg 15s infinite ease-in-out;
                }
            `}</style>
        </section>
    );
};

export default Login;