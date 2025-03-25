import React, { useContext, useState } from 'react'
import { GlobalContext } from './Context/Context'
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Header = () => {

    const { state,  dispatch} = useContext(GlobalContext);
    const navigate = useNavigate();

      const profileOpen = () => {
        navigate('/userprofile')
      }

    return (
    <div>
     <nav className='h-[70px]  bg-gray-900 text-white flex items-center justify-between px-10 font-serif font-bold'>
        <h1 className='text-4xl text-blue-600'>Chat App </h1>
        <div className='flex items-center space-x-4'>
        <h1><Link to='/login' >login</Link></h1>
        <h1><Link to='/signup' >signup</Link></h1>
        <h1><Link to='/userlist' >userlist</Link></h1>
        <h1><Link to='/userprofile' >userprofile</Link></h1>
        
        </div>
        <div>
        <img src={state.user.photoURL}  className='rounded-full h-14 cursor-pointer' onClick={profileOpen}   />

        </div>
     </nav>
    </div>
  )
}

export default Header