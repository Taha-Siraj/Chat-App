import { useEffect, useState } from 'react';
import Header from './Header';
import { collection, addDoc, getFirestore, query, orderBy, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUser || !currentUser) return;
    
    const chatId = [currentUser.uid, selectedUser.uid].sort().join("_");
    const messagesRef = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    const chatId = [currentUser.uid, selectedUser.uid].sort().join("_");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender: currentUser.uid,
      receiver: selectedUser.uid,
      text: newMessage,
      timestamp: new Date().toISOString()
    });
    setNewMessage("");
  };

  return (
    <>
      <Header />
      <div className="flex min-h-[88vh] w-[100%] bg-gray-200 border-t-2 border-gray-500 text-black font-mono capitalize">
        <div className="text-black text-3xl w-[25%] h-[100vh] bg-slate-800">
          {users.map((user) => (
            <div key={user.uid} onClick={() => setSelectedUser(user)} className='flex items-center gap-4 p-4 hover:bg-slate-600'>
              <img src={user.photoURL} className='rounded-full w-[50px] h-[50px]' alt="" />
              <h1>{user.name}</h1>
            </div>
          ))}
        </div>

        <div className='w-[75%] bg-gray-600 h-[100vh] flex flex-col justify-between items-center py-3 px-4'>
          {selectedUser ? (
            <>
              <div className='flex justify-center items-center gap-x-3 capitalize'>
                <img src={selectedUser.photoURL} className='rounded-full w-[50px] h-[50px]' alt="" />
                <h1 className='text-4xl text-white font-semibold font-mono'>Chat With {selectedUser.name}</h1>
              </div>

              <div className='w-[75%] h-[70%] overflow-y-auto bg-gray-700 p-4 rounded-lg'>
                {messages.map((msg, index) => (
                  <div key={index} className={`p-3 my-2 w-fit max-w-[80%] rounded-lg ${msg.sender === currentUser.uid ? 'bg-blue-500 ml-auto' : 'bg-gray-400'}`}>
                    <p className='text-white'>{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className='w-[75%] flex gap-x-3'>
                <input 
                  type="text" 
                  placeholder='Type your message' 
                  className='capitalize border border-gray-500 w-full bg-slate-950 px-4 text-white py-4 rounded-lg outline-none' 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage} className='bg-slate-950 px-4 py-2 text-xl text-white rounded-lg'>Send</button>
              </div>
            </>
          ) : (
            <h1 className='text-3xl text-white'>Select a user to start chatting</h1>
          )}
        </div>
      </div>
    </>
  );
}
