import React, { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { GlobalContext } from "./Context/Context";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

const UserLists = () => {
  const { state } = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const db = getFirestore();
  useEffect(() => {
    if (!state.user) return;
    const saveUser = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", state.user.uid));
        onSnapshot(q, async (querySnapshot) => {
          if (querySnapshot.empty) {
            await addDoc(usersRef, {
              photoURL: state.user.photoURL,
              userName: state.user.displayName,
              email: state.user.email,
              uid: state.user.uid,
              status: "online",
              isOnline: true,
              isTyping: false,
              lastSeen: new Date().toLocaleString(),
            });
            console.log("User Added");
          } else {
            console.log("User Already Exists");
          }
        });
      } catch (e) {
        console.error("Error adding user: ", e);
      }
    };
    saveUser();
  }, [state.user]);
  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersArray);
    });
    return () => unsubscribe(); 
  }, []);
  return (
    <>
      <Header />
      <div className="h-screen bg-gray-800">
        <div className="bg-gray-700 h-full w-[350px]">
          <div className="text-white flex flex-col py-3 px-5 text-2xl font-bold text-center pt-4">
            {users.map((user) => (
              <div
                key={user.uid}
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-x-4 hover:bg-gray-950 cursor-pointer p-2 rounded-md px-4 py-3"
              >
                <img src={user.photoURL} alt="User" className="h-10 w-10 rounded-full" />
                <span>{user.userName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default UserLists;
