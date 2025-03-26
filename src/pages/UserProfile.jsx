import { getAuth, signOut } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './Context/Context';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Header from './Header';

const UserProfile = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const navigate = useNavigate();
    const db = getFirestore();

    const [photoURL, setPhotoURL] = useState(localStorage.getItem("photoURL") || "default-photo-url");
    const [displayName, setDisplayName] = useState(localStorage.getItem("displayName") || "Anonymous");
    const [email, setEmail] = useState(localStorage.getItem("email") || "No email");

    const fetchUserFromFirestore = async (uid) => {
        if (!uid) return; 

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                localStorage.setItem("photoURL", userData.photoURL || "default-photo-url");
                localStorage.setItem("displayName", userData.displayName || "Anonymous");
                localStorage.setItem("email", userData.email || "No email");
                setPhotoURL(userData.photoURL || "default-photo-url");
                setDisplayName(userData.displayName || "Anonymous");
                setEmail(userData.email || "No email");
            } else {
                console.log("User does not exist in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };
    useEffect(() => {
        console.log("state.user:", state.user); 

        if (state.user?.uid) {
            localStorage.setItem("photoURL", state.user.photoURL || "default-photo-url");
            localStorage.setItem("displayName", state.user.displayName || "Anonymous");
            localStorage.setItem("email", state.user.email || "No email");

            setPhotoURL(state.user.photoURL || "default-photo-url");
            setDisplayName(state.user.displayName || "Anonymous");
            setEmail(state.user.email || "No email");
        } else {
            console.log("User not found in state, fetching from Firestore...");
            fetchUserFromFirestore(state.user?.uid);
        }
    }, [state.user]);

    const logout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                localStorage.clear(); 
                dispatch({ type: 'USER_LOGOUT' });
                navigate("/login");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
      <>
     
        <div className='flex justify-end'>
            <div className='flex flex-col gap-y-3 text-white text-center items-center h-[88vh] bg-gray-800 justify-center w-[400px]'>
                <img src={photoURL} alt="Profile" className='rounded-full h-20 cursor-pointer' />
                <h1 className='text-2xl'>Name: {displayName}</h1>
                <h1 className='text-2xl'>Your Email: {email}</h1>
                <button
                    type='submit'
                    onClick={logout}
                    className='cursor-pointer bg-[#dadada] py-1 px-4 rounded-lg text-4xl text-blue-800 font-mono font-extrabold'
                >
                    Logout
                </button>
            </div>
        </div>
        </>
    );
};

export default UserProfile;
