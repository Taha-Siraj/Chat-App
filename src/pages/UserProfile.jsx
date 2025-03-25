import { getAuth, signOut } from 'firebase/auth';
import React, { useContext } from 'react'
import { GlobalContext } from './Context/Context';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {

    const {state , dispatch} = useContext(GlobalContext)
    const navigate = useNavigate()
    console.log(state.user)
    const logout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                dispatch({ type: 'USER_LOGOUT' });
                navigate("/login")
            })
            .catch((error) => {
                  console.log(error);
           });
           };
           

  return (
    <div className=' flex justify-end'>
    <div className='flex  flex-col gap-y-3 text-white text-center items-center h-[88vh] bg-gray-800 justify-center w-[400px] '>
    <img src={state.user.photoURL} alt="images" className='rounded-full h-20 cursor-pointer' />
      <h1 className='text-2xl' >Name: {state.user.displayName}</h1>
      <h1 className='text-2xl' >Your Email: {state.user.email}</h1>
      <button type='submit' onClick={logout} className='cursor-pointer bg-[#dadada] py-1 px-4 rounded-lg text-4xl text-blue-800 font-mono font-extrabold'>Logout </button>
    </div>
    </div>
  )
}

export default UserProfile
