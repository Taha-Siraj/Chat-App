import { useContext, useEffect, useState } from 'react';
import Header from './Header';
import { GlobalContext } from './Context/Context';
import { collection, addDoc, getFirestore, getDocs } from "firebase/firestore";

export default function UserList() {
  const { state } = useContext(GlobalContext);
  const [users, setUsers] = useState([]);
  const [selectedUser , setselectedUser] = useState(null);
  const fetchUser = async () => {
    const db = getFirestore();
    try {
      const existingUsers = await getDocs(collection(db, "users"));
      const userExists = existingUsers.docs.some(doc => doc.data().uid === state.user.uid);
      if (!userExists) {
        await addDoc(collection(db, "users"), {
          name: state.user.displayName,
          photoURL: state.user.photoURL,
          uid: state.user.uid,
          online: true,
          date: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isTyping: false,
        });
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  useEffect(() => {
    const db = getFirestore();
    const getUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => doc.data());
      setUsers(userList);
    };
    getUsers();
    fetchUser(); 
  }, []);

  return (
    <>
      <Header />
      <div className="flex min-h-[88vh] w-[100%] bg-gray-200 border-t-2 border-gray-500 text-black font-mono capitalize ">
        <div className="text-black text-3xl w-[25%] h-[100vh] bg-slate-800">
          {users.map((user) => (
            <div key={user.uid} onClick={() => setselectedUser(user)} className='flex items-center gap-4 p-4 hover:bg-slate-600 '>
              <img src={user.photoURL} className='rounded-full w-[50px] h-[50px]' alt="" />
            <h1>{user.name}</h1>
            </div>
          ))}
        </div>
        <div className='w-[75%] bg-gray-600  h-[100vh] flex flex-col justify-between items-center py-3 px-4'>
          <div className='flex justify-center items-center gap-x-3 capitalize'>
          <img src={selectedUser?.photoURL}  className='rounded-full w-[50px] h-[50px]' alt="" />
          <h1 className='text-4xl text-white font-semibold font-mono '>Chat With {selectedUser?.name}</h1>
          </div>
          <div className='w-[75%] flex  gap-x-3'>
            <input type="text" placeholder='type your message' className=' capitalize border  border-gray-500 w-full bg-slate-950 px-4 text-white py-4  rounded-lg outline-none' />
            <button className='bg-slate-950 px-4 py-2 text-xl text-white rounded-lg'>Sent</button>
          </div>
        </div>
      </div>
    </>
  );
}
