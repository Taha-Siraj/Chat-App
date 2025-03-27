import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from './Context/Context'
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
 
const Header = () => {
    const { state,  dispatch} = useContext(GlobalContext);
    const [photoURL, setPhotoURL] = useState(localStorage.getItem("photoURL") || "default-photo-url");
    const navigate = useNavigate();
    const [open , setOpen] = useState(false);

    useEffect(() => {
      if(state.user?.photoURL){
        localStorage.setItem("photoURL", state.user?.photoURL);
        setPhotoURL(state.user.photoURL); 
      }
    }, [state.user])
      const profileOpen = () => {
        navigate('/userprofile')
      }
          const db = getFirestore();
      
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
                      navigate("/");
                  })
                  .catch((error) => {
                      console.log(error);
                  });
          };
      
    return (
    <div>
     <nav className='h-[70px]  bg-gray-900 text-white flex items-center justify-between px-10 font-serif font-bold'>
        <h1 className='text-4xl text-blue-600'>Chat App </h1>
        <div className='flex items-center space-x-4'>
        
        </div>
        <div>
        <img src={photoURL}  className='rounded-full h-14 cursor-pointer active:scale-90' onClick={() => {setOpen(prev => !prev)}}  alt='images'  />
        </div>
     </nav>
     {open ? (  <div className='flex justify-end '>
            <div className='flex flex-col gap-y-3 text-white text-center items-center h-[88vh] bg-gray-800 justify-center w-[400px]'>
                <img src={photoURL} alt="Profile" className='rounded-full h-20 cursor-pointer' />
                <h1 className='text-2xl'>Name: {displayName}</h1>
                <h1 className='text-2xl'>Your Email: {email}</h1>
                <button
                    type='submit'
                    onClick={logout}
                    className='cursor-pointer active:scale-90 bg-[#dadada] py-1 px-4 rounded-lg text-4xl text-blue-800 font-mono font-extrabold'
                >
                    Logout
                </button>
            </div>
        </div>) 
        : null}
    </div>
  )
}

export default Header