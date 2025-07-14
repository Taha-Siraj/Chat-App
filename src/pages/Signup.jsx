import React, { useState, useContext } from 'react';
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions
import { GlobalContext } from './Context/Context';
import { ClipLoader } from 'react-spinners';
import { toast, Toaster } from 'sonner'; // Using Sonner for premium toasts

const Signup = () => {
    const [passwordShown, setPasswordShown] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { dispatch } = useContext(GlobalContext);

    const navigate = useNavigate();
    const db = getFirestore(); // Initialize Firestore

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Client-side Validation ---
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.warning('Please fill in all input fields.', { duration: 2000 });
            return;
        }
        if (password.length < 6) {
            toast.warning('Password must be at least 6 characters long.', { duration: 3000 });
            return;
        }

        setLoading(true);
        const auth = getAuth();

        try {
            // 1. Create User with Email and Password in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Firebase Auth Profile (Display Name and default Photo URL)
            const defaultPhotoURL = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`; // Dynamic avatar
            await updateProfile(user, {
                displayName: name.trim(),
                photoURL: defaultPhotoURL
            });

            // 3. Store User Data in Firestore (essential for chat app features like user list, online status)
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                userName: name.trim(),
                email: email.trim(),
                photoURL: defaultPhotoURL,
                status: "online", // Set initial status as online
                lastSeen: serverTimestamp(),
                createdAt: serverTimestamp(),
            }, { merge: true }); // Use merge:true to create or update document safely

            // 4. Update Global Context
            // Dispatch with the updated user object from updateProfile
            dispatch({
                type: 'USER_LOGIN',
                payload: {
                    ...user,
                    displayName: name.trim(),
                    photoURL: defaultPhotoURL
                }
            });

            toast.success(`Welcome to ChatApp, ${name.trim()}! Account created successfully.`, { duration: 2000 });
            navigate("/userlist"); // Navigate to chat user list after successful signup

        } catch (error) {
            console.error("Signup Error:", error.code, error.message);
            let errorMessage = "Account creation failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email address is already registered. Please login or use a different email.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please choose a stronger password (min 6 characters).";
            } else if (error.code === 'auth/network-request-failed') { // Added network error
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage, { duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-poppins px-4 py-8 relative overflow-hidden">
            <Toaster position="top-center" richColors closeButton />

            {/* Background elements for visual interest */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-full h-full bg-cover bg-center animate-pulse-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546435017-f584b423d21c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}></div>
            </div>
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div> {/* Dark overlay */}

            <div className="relative z-20 w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transform transition-all duration-300 animate-fade-in-up-card">
                <h1 className="text-4xl font-extrabold text-center text-green-400 mb-8 animate-fade-in-up">
                    Join ChatApp!
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        {/* FIX: htmlFor instead of for */}
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            // FIX: Consistent input styling like Login
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200"
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>
                    <div>
                        {/* FIX: htmlFor instead of for */}
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // FIX: Consistent input styling like Login
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200"
                            placeholder="e.g., yourname@example.com"
                            required
                        />
                    </div>
                    <div className="relative">
                        {/* FIX: htmlFor instead of for */}
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type={passwordShown ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // FIX: Consistent input styling like Login, and pr-12 for eye icon
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200 pr-12"
                            placeholder="•••••••• (min 6 characters)"
                            required
                        />
                        <span
                            // FIX: Icon position adjusted
                            className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400 hover:text-white transition-colors top-8"
                            onClick={() => setPasswordShown(prev => !prev)}
                            aria-label={passwordShown ? "Hide password" : "Show password"}
                        >
                            {passwordShown ? <BiSolidShow className="text-xl" /> : <BiSolidHide className="text-xl" />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        // FIX: Consistent button styling like Login, but with green accent
                        className="w-full py-3 px-5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && <ClipLoader size={20} color="#fff" />}
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-gray-400 text-center mt-6">
                    Already have an account?{' '}
                    {/* FIX: Link styling matches Login, but with green accent */}
                    <Link to="/login" className="font-medium text-green-400 hover:underline hover:text-green-300 transition-colors duration-200">
                        Login here
                    </Link>
                </p>
            </div>

            {/* Tailwind CSS Custom Animations (add to tailwind.config.js) */}
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up-card {
                    from { opacity: 0; transform: translateY(50px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse-bg {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                .animate-fade-in-up-card { animation: fade-in-up-card 0.7s ease-out forwards; }
                .animate-pulse-bg { animation: pulse-bg 15s infinite ease-in-out; }
            `}</style>
        </section>
    );
};

export default Signup;