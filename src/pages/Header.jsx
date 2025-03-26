import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from './Context/Context'
import { Link, useNavigate } from 'react-router-dom';
const Header = () => {
    const { state,  dispatch} = useContext(GlobalContext);
    const [photoURL, setPhotoURL] = useState(localStorage.getItem("photoURL") || "default-photo-url");

    const navigate = useNavigate();
    useEffect(() => {
      if(state.user?.photoURL){
        localStorage.setItem("photoURL", state.user?.photoURL);
        setPhotoURL(state.user.photoURL); 
      }
    }, [state.user])
      const profileOpen = () => {
        navigate('/userprofile')
      }
    return (
    <div>
     <nav className='h-[70px]  bg-gray-900 text-white flex items-center justify-between px-10 font-serif font-bold'>
        <h1 className='text-4xl text-blue-600'>Chat App </h1>
        <div className='flex items-center space-x-4'>
        
        </div>
        <div>
        <img src={photoURL}  className='rounded-full h-14 cursor-pointer' onClick={profileOpen}   />
        </div>
     </nav>
    </div>
  )
}

export default Header