import { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from './Header';
import { GlobalContext } from './Context/Context';

export default function ChatDashboard() {

    const {state , dispatch} = useContext(GlobalContext);

    const userData = {
        name: state.user.displayName,
        email: state.user.email,
        photoURL: state.user.photoURL
    }

    return (
       <>
      <Header/>
      <div className='py-5'>
        <div className='flex gap-x-4 rounded-md bg-slate-700 items-center w-[250px] py-5 px-3'>
           <img src={userData.photoURL} className='rounded-full' alt="" width={50} />
            <h1 className='text-2xl '>{userData.name}</h1>
        </div>
      </div>   
       </>
    );
}
