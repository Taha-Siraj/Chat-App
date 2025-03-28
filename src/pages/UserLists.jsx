import { useContext, useEffect, useState } from 'react';
import Header from './Header';
import { GlobalContext } from './Context/Context';
import { collection, addDoc, getFirestore, getDocs } from "firebase/firestore";

export default function UserList() {
  const { state } = useContext(GlobalContext);
  const [users, setUsers] = useState([]);

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
      <div className="flex-col flex min-h-[88vh] w-[100%] bg-gray-200 border-t-2 border-gray-500 text-black font-mono capitalize">
        <div className="text-black text-3xl">
          {users.map((user) => (
            <div key={user.uid}>
              <h1>{user.name}</h1>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
