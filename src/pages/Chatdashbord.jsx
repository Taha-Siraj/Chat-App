import { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from './Header';
import { GlobalContext } from './Context/Context';
import { collection, addDoc, getFirestore } from "firebase/firestore"; 

export default function ChatDashboard() {

    const {state , dispatch} = useContext(GlobalContext);
    const db = getFirestore();
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
    if (user) {
        dispatch( {type: 'USER_LOGIN', payload: user})
        const uid = user.uid;
    } else {
        dispatch( {type: 'USER_LOGOUT'})
    }
    });

    useEffect(() => {
      const addData = async () => {
        try {
            const docRef = await addDoc(collection(db, "Chats"), {
                name: state.user.displayName,
                email: state.user.email,
                photoURL: state.user.photoURL,
                lastSeen: new Date(),
                uid: state.user.uid,
                online: true,
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
      }
      addData()
    } ,[ ]);

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
