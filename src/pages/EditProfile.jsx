import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './Context/Context';
import { getFirestore, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getAuth, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { FaSave, FaTimesCircle, FaUpload, FaSpinner, FaLock, FaCheckCircle, FaPhoneAlt } from 'react-icons/fa';
import Header from './Header';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfile = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const navigate = useNavigate();
    const db = getFirestore();
    const auth = getAuth();
    const storage = getStorage();

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isReauthenticating, setIsReauthenticating] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [formData, setFormData] = useState({
        userName: state.user?.displayName || '',
        email: state.user?.email || '',
        newPassword: '',
        confirmNewPassword: '',
        photoURL: state.user?.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user?.uid || 'default'}`,
        bio: '',
        phone: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchInitialProfileData = async () => {
            if (!state.user || !state.user.uid) {
                setLoading(false);
                toast.error("You must be logged in to edit your profile.");
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                const authUser = auth.currentUser;
                if (!authUser) {
                     setLoading(false);
                     toast.error("Authentication session missing. Please log in again.");
                     navigate('/login');
                     return;
                }

                let currentProfile = {
                    userName: authUser.displayName || "Anonymous User",
                    email: authUser.email || "No email provided",
                    photoURL: authUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${authUser.uid}`,
                    uid: authUser.uid,
                    newPassword: '',
                    confirmNewPassword: '',
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
                setFormData(currentProfile);
            } catch (error) {
                console.error("Error fetching initial profile data:", error);
                toast.error("Failed to load profile data. Please try refreshing.", { duration: 4000 });
                setFormData(prev => ({
                    ...prev,
                    userName: state.user?.displayName || "Error Name",
                    email: state.user?.email || "Error Email",
                    photoURL: state.user?.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user?.uid || 'error'}`,
                    uid: state.user?.uid || 'Error UID',
                }));
            } finally {
                setLoading(false);
            }
        };

        if (state.user?.uid) {
            fetchInitialProfileData();
        } else if (state.user === null) {
            setLoading(false);
            toast.error("You must be logged in to edit your profile.");
            navigate('/login');
        }

    }, [state.user, db, navigate, auth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoURL: reader.result }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const reauthenticateUser = async () => {
        if (!currentPassword) {
            toast.error("Please enter your current password to confirm changes.");
            return false;
        }
        setIsReauthenticating(true);
        try {
            if (!auth.currentUser || !auth.currentUser.email) {
                toast.error("Authentication session missing. Please log in again.");
                navigate('/login');
                return false;
            }
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            toast.success("Authentication confirmed.", { duration: 1500 });
            return true;
        } catch (error) {
            console.error("Re-authentication failed:", error);
            let errorMessage = "Re-authentication failed. Please check your current password.";
            if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect current password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email for re-authentication.";
            } else if (error.code === 'auth/user-mismatch') {
                errorMessage = "User mismatch. Please log in with the correct account.";
            } else if (error.code === 'auth/too-many-requests') {
                 errorMessage = "Too many failed attempts. Try again later.";
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = "Your session expired. Please log out and log in again.";
            }
            toast.error(errorMessage, { duration: 3000 });
            return false;
        } finally {
            setIsReauthenticating(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const user = auth.currentUser;
        if (!user) {
            toast.error("No user is logged in. Please log in again.");
            setIsSaving(false);
            navigate('/login');
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            toast.error("New password and confirm password do not match.");
            setIsSaving(false);
            return;
        }
        if (formData.newPassword && formData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            setIsSaving(false);
            return;
        }

        const isEmailPasswordProvider = user.providerData.some(provider => provider.providerId === 'password');
        const requiresReauth = (formData.email !== user.email || formData.newPassword) && isEmailPasswordProvider;

        if (requiresReauth) {
            const reauthSuccess = await reauthenticateUser();
            if (!reauthSuccess) {
                setIsSaving(false);
                return;
            }
        }
        if ((formData.email !== user.email || formData.newPassword) && !isEmailPasswordProvider) {
            toast.info("For social logins (like Google), email/password changes must be done through your social provider's settings. Other profile details will be updated.", { duration: 6000 });
        }

        let newPhotoURL = formData.photoURL;

        try {
            if (selectedImage) {
                const imageRef = ref(storage, `profile_pictures/${user.uid}/${selectedImage.name}`);
                await uploadBytes(imageRef, selectedImage);
                newPhotoURL = await getDownloadURL(imageRef);
                toast.success("Profile image uploaded!", { duration: 1500 });
            }

            const authUpdates = {};
            if (formData.userName.trim() !== user.displayName) {
                authUpdates.displayName = formData.userName.trim();
            }
            if (newPhotoURL !== user.photoURL) {
                authUpdates.photoURL = newPhotoURL;
            }
            if (Object.keys(authUpdates).length > 0) {
                await updateProfile(user, authUpdates);
            }

            if (formData.email.trim() !== user.email && isEmailPasswordProvider) {
                await updateEmail(user, formData.email.trim());
                toast.success("Email updated in Firebase Authentication!", { duration: 1500 });
            } else if (formData.email.trim() !== user.email && !isEmailPasswordProvider) {
                console.warn("Skipping Firebase Auth email update for OAuth user.");
            }

            if (formData.newPassword && isEmailPasswordProvider) {
                await updatePassword(user, formData.newPassword);
                toast.success("Password updated successfully!", { duration: 1500 });
            } else if (formData.newPassword && !isEmailPasswordProvider) {
                console.warn("Skipping Firebase Auth password update for OAuth user.");
            }

            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                userName: formData.userName.trim(),
                email: formData.email.trim(),
                photoURL: newPhotoURL,
                bio: formData.bio.trim(),
                phone: formData.phone.trim(),
                lastUpdated: serverTimestamp()
            });

            await user.reload();
            const updatedAuthUser = auth.currentUser;

            dispatch({
                type: 'USER_LOGIN',
                payload: {
                    ...updatedAuthUser,
                    bio: formData.bio.trim(),
                    phone: formData.phone.trim(),
                }
            });

            toast.success("Profile updated successfully!", { duration: 2000 });
            navigate('/userprofile');
        } catch (error) {
            console.log("Error updating profile:", error);
            let errorMessage = "Failed to update profile. Please try again.";
            if (error.code === 'auth/requires-recent-login') {
                errorMessage = "Your session expired. Please log out and log in again to update sensitive information.";
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already in use by another account.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "New password is too weak. Please choose a stronger one.";
            } else if (error.code === 'storage/unauthorized') {
                errorMessage = "Permission denied to upload image. Check Firebase Storage rules.";
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = "Re-authentication failed. Please verify your current password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format provided.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage, { duration: 5000 });
        } finally {
            setIsSaving(false);
            setCurrentPassword('');
            setFormData(prev => ({...prev, newPassword: '', confirmNewPassword: ''}));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <FaSpinner className="text-5xl text-indigo-500 animate-spin mb-4" />
                <p className="text-lg text-gray-400 ml-4">Loading editor...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white font-poppins pt-16 relative overflow-hidden">
            <Header />
            <Toaster position="top-center" richColors closeButton />

            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-full h-full bg-cover bg-center animate-pulse-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546435017-f584b423d21c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}></div>
            </div>
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div>

            <section className="relative z-20 flex flex-col items-center justify-center py-12 px-4 md:px-8 lg:px-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-400 mb-10 text-center animate-fade-in-up">
                    Edit Profile
                </h1>

                <form onSubmit={handleUpdateProfile} className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transform transition-all duration-300 animate-fade-in-up-card">
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src={selectedImage ? formData.photoURL : (formData.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user?.uid || 'default'}`)}
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg mb-4"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2">
                            <FaUpload /> Change Photo
                            <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            />
                        </label>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                id="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                                placeholder="e.g., +92 3XX XXXXXXX"
                            />
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio (Optional)</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200 resize-y"
                                placeholder="Tell us about yourself..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8 p-6 bg-gray-900 rounded-lg shadow-inner">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FaLock className="text-lg text-yellow-400" /> Change Password</h3>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">Current Password (for sensitive changes)</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                                placeholder="Enter your current password"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                                placeholder="New password (min 6 characters)"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving || isReauthenticating}
                        >
                            {isSaving ? (
                                <><FaSpinner className="animate-spin" /> Saving...</>
                            ) : (
                                <><FaSave /> Save Changes</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/userprofile')}
                            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving || isReauthenticating}
                        >
                            <FaTimesCircle /> Cancel
                        </button>
                    </div>
                    {isReauthenticating && (
                        <p className="text-center text-sm text-yellow-400 mt-4">
                            <FaSpinner className="inline-block animate-spin mr-2" />
                            Confirming your identity...
                        </p>
                    )}
                </form>
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

export default EditProfile;