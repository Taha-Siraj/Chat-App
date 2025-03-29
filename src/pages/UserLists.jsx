import React, { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { GlobalContext } from "./Context/Context";
import { getFirestore, collection, addDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";

const UserLists = () => {
  const { state } = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([]);
  const db = getFirestore();
  useEffect(() => {
    if(!state.user || !selectedUser) return;
    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [state.user.uid, selectedUser.uid]),
      where("receiverId", "in", [state.user.uid, selectedUser.uid])
    );
  const unsubscribe = onSnapshot(q, (snapshot) => {
  const messagesArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setMessages(messagesArray);
  })
  return () => unsubscribe(); 
  }, [state.user, selectedUser]);
    const sendMessage = async () => {
      if (!messageText.trim() || !state.user || !selectedUser) return;
      try {
        await addDoc(collection(db, "messages"), {
          senderId: state.user.uid,  
          receiverId: selectedUser.uid,
          text: messageText, 
          timestamp: new Date() 
        });   
        setMessageText("")
      } catch (error) {
        console.error("Message send error:", error);
      }
    };

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
      <div className="h-screen bg-gray-800 flex">
        <div className="bg-gray-950 h-full w-[30%]">
          <div className="text-white flex flex-col py-3 px-4 text-2xl font-bold text-center pt-4">
            {users.map((user) => (
              <div
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-x-4 hover:bg-gray-700 cursor-pointer p-2 rounded-md px-4 py-3  active:scale-90"
              >
                <img src={user.photoURL} alt="User" className="h-10 w-10 rounded-full" />
                <span>{user.userName}</span>
              </div>
            ))}
          </div>

        </div>
        <div className="bg-gray-800 text-white capitalize w-full flex flex-col  justify-between items-center py-4 gap-y-10 px-4">
       <div className="flex gap-x-5 items-center gap-y-4 ">
        <img src={selectedUser?.photoURL} alt="" className="h-14 w-14 rounded-full" />
       <h1 className="text-4xl text-center font-mono font-medium">Chat with {selectedUser?.userName}</h1>
       </div>
        <div className="font-mono bg-gray-600 h-full w-full rounded-md px-5 py-10 flex flex-col gap-y-4 overflow-y-auto">
    {messages.map((msg) => (
      <div 
        key={msg.id} 
        className={`flex w-full ${msg.senderId === state.user.uid ? "justify-end" : "justify-start"}`}
      >
        <span 
          className={`py-2 px-4 rounded-lg max-w-[70%] text-white ${
            msg.senderId === state.user.uid ? "bg-blue-500" : "bg-gray-500"
          }`}
        >
          {msg.text}
        </span>
      </div>
    ))}
      </div>
       <div className="py-5 px-10 flex gap-x-5 w-full">
       <input className="py-3 px-4 border bg-gray-950 rounded-lg outline-none border-gray-500 w-full text-xl font-mono"
        type="text"
        value={messageText} 
        onChange={(e) => setMessageText(e.target.value)}  
        placeholder="Type your message..."
      />
       <button onClick={sendMessage} className="py-2 px-4 border bg-gray-950 rounded-lg outline-none text-xl " >Sent</button>
       </div>
        </div>
      </div>
    </>
  );
};
export default UserLists;
