import { useContext, useEffect, useState } from 'react';
import Header from './Header';
import { GlobalContext } from './Context/Context';
import { addDoc, collection, getDocs, getFirestore, query } from "firebase/firestore"; 

export default function UserList() {
  const {state, dispatch} = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [data, setData] = useState([]);

  const fetchUser = async () => {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, "users"), {
      name: state.user?.displayName,
      photoURL: state.user?.photoURL,
    });
    console.log("Document written with ID: ", docRef.id);
  }

  useEffect(() => {
    const getUser = async () => {
      const db = getFirestore();
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setData(users);
    };

    fetchUser();
    getUser();
  }, []);

  return (
    <>
      <Header />
      <div className='flex h-[88vh] w-[100%] font-mono capitalize'>
        <div className='min-h-[88vh] w-[450px] bg-gray-800'>
          <div>
            {data.map((user) => (
              <div 
                key={user.id} 
                className='flex p-4 items-center gap-x-4 cursor-pointer hover:bg-gray-700 transition'
                onClick={() => setSelectedUser(user)}
              >
                <img src={user.photoURL} alt="" className='rounded-full h-[60px] w-[60px]' />
                <h1 className='text-white text-2xl font-mono'>{user.name}</h1>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center justify-between w-full min-h-[88vh] bg-gray-900 p-6 text-white'>
          <div>
            {selectedUser ? (
              <>
                <h1 className='text-3xl font-bold'>{selectedUser.name}</h1>
                <p className='text-lg mt-2'>Chat with {selectedUser.name}</p>
              </>
            ) : (
              <h1 className='text-3xl text-gray-400'>Select a user to start chatting</h1>
            )}
          </div>
          <div className='w-full flex gap-x-3 capitalize text-xl font-mono'>
            <input 
              type="text" 
              className='py-2 px-4 w-full bg-gray-800 rounded-md border hover:border-[#4a9bff] outline-none'  
            />
            <button className='bg-[#4a9bff] py-2 px-4 rounded-md'>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}