import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './Context/Context';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FaUserCircle, FaEnvelope, FaIdCard, FaSpinner, FaEdit, FaPhoneAlt, FaInfoCircle } from 'react-icons/fa'; // Added FaPhoneAlt, FaInfoCircle
import Header from './Header';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const Userprofile = () => {
    const { state } = useContext(GlobalContext);
    const db = getFirestore();
    const navigate = useNavigate(); // Initialize useNavigate
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        userName: "Loading...",
        email: "Loading...",
        photoURL: "https://api.dicebear.com/7.x/pixel-art/svg?seed=placeholder",
        uid: "Loading...",
        bio: "", // Initialize bio
        phone: "" // Initialize phone
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!state.user || !state.user.uid) {
                setProfileData({
                    userName: "Not Logged In",
                    email: "N/A",
                    photoURL: "https://api.dicebear.com/7.x/pixel-art/svg?seed=guest",
                    uid: "N/A",
                    bio: "Please log in to view your profile details.",
                    phone: "N/A"
                });
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const authUser = state.user;
                let currentProfile = {
                    userName: authUser.displayName || "Anonymous User",
                    email: authUser.email || "No email provided",
                    photoURL: authUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${authUser.uid}`,
                    uid: authUser.uid,
                    bio: "",
                    phone: ""
                };

                const userDocRef = doc(db, "users", authUser.uid);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    const firestoreData = userSnap.data();
                    currentProfile = {
                        ...currentProfile,
                        userName: firestoreData.userName || currentProfile.userName,
                        email: firestoreData.email || currentProfile.email,
                        photoURL: firestoreData.photoURL || currentProfile.photoURL,
                        bio: firestoreData.bio || '',
                        phone: firestoreData.phone || ''
                    };
                }

                setProfileData(currentProfile);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setProfileData(prev => ({
                    ...prev,
                    userName: state.user.displayName || "Error loading name",
                    email: state.user.email || "Error loading email",
                    photoURL: state.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user.uid}`,
                    uid: state.user.uid,
                    bio: "Could not load additional info.",
                    phone: "N/A"
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [state.user, db]);

    return (
        <div className="min-h-screen bg-gray-950 text-white font-poppins pt-16 relative overflow-hidden">
            <Header />

           

            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-full h-full bg-cover bg-center animate-pulse-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546435017-f584b423d21c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}></div>
            </div>
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div>

            <section className="relative z-20 flex flex-col items-center justify-center py-12 px-4 md:px-8 lg:px-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-400 mb-10 text-center animate-fade-in-up">
                    My Profile
                </h1>

                <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transform transition-all duration-300 animate-fade-in-up-card">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <FaSpinner className="text-5xl text-indigo-500 animate-spin mb-4" />
                            <p className="text-lg text-gray-400">Loading profile...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center mb-8">
                                <img
                                    src={profileData.photoURL}
                                    alt={profileData.userName}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg animate-fade-in"
                                    loading="lazy"
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center bg-gray-900 p-4 rounded-lg shadow-inner">
                                    <FaUserCircle className="text-2xl text-indigo-400 mr-4 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-400">Full Name</p>
                                        <h2 className="text-xl font-semibold text-white break-words">{profileData.userName}</h2>
                                    </div>
                                </div>

                                <div className="flex items-center bg-gray-900 p-4 rounded-lg shadow-inner">
                                    <FaEnvelope className="text-2xl text-green-400 mr-4 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-400">Email Address</p>
                                        <h2 className="text-xl font-semibold text-white break-words">{profileData.email}</h2>
                                    </div>
                                </div>

                                {profileData.phone && profileData.phone !== "N/A" && (
                                    <div className="flex items-center bg-gray-900 p-4 rounded-lg shadow-inner">
                                        <FaPhoneAlt className="text-2xl text-orange-400 mr-4 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-400">Phone Number</p>
                                            <h2 className="text-xl font-semibold text-white break-words">{profileData.phone}</h2>
                                        </div>
                                    </div>
                                )}
                                
                                {profileData.bio && profileData.bio !== "Please log in to view your profile details." && profileData.bio !== "Could not load additional info." && (
                                    <div className="bg-gray-900 p-4 rounded-lg shadow-inner">
                                        <p className="text-sm text-gray-400 mb-2">Bio</p>
                                        <p className="text-white break-words">{profileData.bio}</p>
                                    </div>
                                )}

                                <div className="flex items-center bg-gray-900 p-4 rounded-lg shadow-inner">
                                    <FaIdCard className="text-2xl text-purple-400 mr-4 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-400">User ID (UID)</p>
                                        <h2 className="text-lg font-semibold text-white break-words font-mono select-all">{profileData.uid}</h2>
                                    </div>
                                </div>
                            </div>

                            {state.user ? (
                                <button
                                    onClick={() => navigate('/edit-profile')}
                                    className="mt-10 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
                                >
                                    <FaEdit /><Link to={'/editprofile'} >  Edit Profile </Link>
                                </button>
                            ) : (
                                <div className="mt-10 text-center text-gray-400">
                                    <FaInfoCircle className="text-3xl inline-block mb-2 text-blue-400" />
                                    <p>Login to view and edit your complete profile.</p>
                                    <Link to="/login" className="text-indigo-400 hover:underline mt-2 inline-block">Go to Login</Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in-up-card { from { opacity: 0; transform: translateY(50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse-bg { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                .animate-fade-in-up-card { animation: fade-in-up-card 0.7s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-pulse-bg { animation: pulse-bg 15s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default Userprofile;