import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaComments, FaLock, FaRocket, FaMobileAlt, FaUsers } from 'react-icons/fa'; // Icons for features
import { GlobalContext } from './Context/Context'; // Assuming you have a GlobalContext for user state
import Header from './Header'; // Assuming you have a Header component

const Home = () => {
    const { state } = useContext(GlobalContext); // To check if the user is logged in

    return (
        <div className="min-h-screen bg-gray-950 text-white font-poppins relative overflow-hidden">
            <Header /> {/* Include your global Header component */}

            {/* Background elements for visual interest */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-full h-full bg-cover bg-center animate-pulse-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546435017-f584b423d21c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}></div>
            </div>
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div> {/* Dark overlay */}

            {/* Hero Section */}
            <section className="relative z-20 flex flex-col items-center justify-center pt-24 pb-20 md:py-32 text-center px-4 md:px-8 lg:px-16">
                <FaComments className="text-8xl text-indigo-500 mb-6 animate-fade-in-up delay-100" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up delay-200 drop-shadow-lg">
                    Connect Instantly.<br /> Chat Seamlessly.
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mb-10 animate-fade-in-up delay-300">
                    Experience real-time conversations with friends, family, and colleagues. Fast, secure, and intuitive chat at your fingertips.
                </p>
                {state.user ? (
                    <Link
                        to="/userlist"
                        className="bg-indigo-600 text-white py-4 px-10 rounded-full font-bold text-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up delay-400"
                    >
                        Go to Chat
                    </Link>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-400">
                        <Link
                            to="/signup"
                            className="bg-indigo-600 text-white py-4 px-8 rounded-full font-bold text-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                        >
                            Get Started - It's Free!
                        </Link>
                        <Link
                            to="/login"
                            className="bg-transparent border-2 border-indigo-500 text-indigo-300 py-4 px-8 rounded-full font-bold text-xl hover:bg-indigo-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Log In
                        </Link>
                    </div>
                )}
            </section>

            {/* Features Section */}
            <section className="relative z-20 bg-gray-800 py-16 px-4 md:px-8 lg:px-16 shadow-inner">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 animate-fade-in-up">
                    Why Choose ChatApp?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center p-6 bg-gray-900 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-500">
                        <FaRocket className="text-5xl text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Blazing Fast</h3>
                        <p className="text-gray-300 text-center">
                            Send and receive messages in real-time with lightning speed. No more waiting!
                        </p>
                    </div>
                    {/* Feature 2 */}
                    <div className="flex flex-col items-center p-6 bg-gray-900 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-600">
                        <FaLock className="text-5xl text-yellow-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                        <p className="text-gray-300 text-center">
                            Your conversations are encrypted and private. Chat with peace of mind.
                        </p>
                    </div>
                    {/* Feature 3 */}
                    <div className="flex flex-col items-center p-6 bg-gray-900 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-700">
                        <FaMobileAlt className="text-5xl text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Cross-Platform</h3>
                        <p className="text-gray-300 text-center">
                            Access your chats from any device - desktop, tablet, or mobile.
                        </p>
                    </div>
                    {/* Feature 4 */}
                    <div className="flex flex-col items-center p-6 bg-gray-900 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-800">
                        <FaUsers className="text-5xl text-red-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">User-Friendly</h3>
                        <p className="text-gray-300 text-center">
                            An intuitive interface designed for effortless communication.
                        </p>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="relative z-20 py-20 px-4 md:px-8 lg:px-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 animate-fade-in-up delay-900">
                    Ready to Start Chatting?
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-1000">
                    Join thousands of users who are enjoying seamless communication. Sign up now and connect with your world!
                </p>
                {state.user ? (
                    <Link
                        to="/userlist"
                        className="bg-indigo-600 text-white py-4 px-10 rounded-full font-bold text-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up delay-1100"
                    >
                        Continue to Chat
                    </Link>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-1100">
                        <Link
                            to="/signup"
                            className="bg-indigo-600 text-white py-4 px-8 rounded-full font-bold text-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                        >
                            Create Free Account
                        </Link>
                        <Link
                            to="/login"
                            className="bg-transparent border-2 border-indigo-500 text-indigo-300 py-4 px-8 rounded-full font-bold text-xl hover:bg-indigo-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            I Already Have An Account
                        </Link>
                    </div>
                )}
            </section>

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
                .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
                .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
                .animate-fade-in-up.delay-300 { animation-delay: 0.3s; }
                .animate-fade-in-up.delay-400 { animation-delay: 0.4s; }
                .animate-fade-in-up.delay-500 { animation-delay: 0.5s; }
                .animate-fade-in-up.delay-600 { animation-delay: 0.6s; }
                .animate-fade-in-up.delay-700 { animation-delay: 0.7s; }
                .animate-fade-in-up.delay-800 { animation-delay: 0.8s; }
                .animate-fade-in-up.delay-900 { animation-delay: 0.9s; }
                .animate-fade-in-up.delay-1000 { animation-delay: 1.0s; }
                .animate-fade-in-up.delay-1100 { animation-delay: 1.1s; }

                .animate-pulse-bg {
                    animation: pulse-bg 15s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Home;