import React, { useContext, useState } from 'react'
import { GlobalContext } from './Context/Context'
import { useNavigate } from 'react-router-dom';

const Header = () => {

    const {  dispatch} = useContext(GlobalContext);
    const navigate = useNavigate();

    const handleLogout = () => {
    dispatch( { typeof: 'USER_LOGOUT'})
    navigate('/login')
 }
    return (
    <div>
     <nav className='h-[70px]  bg-gray-900 text-white flex items-center justify-between px-10 font-serif font-bold'>
        <h1 className='text-4xl text-blue-600'>Chat App </h1>
        <h1 onClick={handleLogout} className='cursor-pointer bg-green-500 py-1 px-4 rounded-lg text-4xl text-blue-800 font-mono font-extrabold'>Logout </h1>
     </nav>
    </div>
  )
}

export default Header