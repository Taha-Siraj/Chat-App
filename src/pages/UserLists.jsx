import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, getFirestore, where } from 'firebase/firestore';
import Header from './Header';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) addUserToFirestore(user);
    });
    return () => unsubscribe();
  }, []);
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const tempUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(tempUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const addUserToFirestore = async (user) => {
    if (!user) return;
    try {
      const userRef = collection(db, 'users');
      const querySnapshot = await getDocs(query(userRef, where('uid', '==', user.uid)));
      if (querySnapshot.empty) {
        await addDoc(userRef, {
          name: user.displayName || 'Unknown',
          email: user.email || 'No Email',
          photoURL: user.photoURL || '',
          lastSeen: new Date().toISOString(),
          uid: user.uid,
          online: true,
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const chatId = [currentUser.uid, selectedUser.uid].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tempMessages = snapshot.docs.map((doc) => doc.data());
      setMessages(tempMessages);
    });

    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !selectedUser.uid || !currentUser || !currentUser.uid) return;

    const chatId = [currentUser.uid, selectedUser.uid].sort().join('_');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        sender: currentUser.uid,
        receiver: selectedUser.uid,
        timestamp: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const filteredUsers = users.filter((user) => user.name?.toLowerCase().includes(search.toLowerCase()));

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
     <Header/>
 
    <div className="flex py-4 px-4 justify-center h-screen">
      <div className="w-1/3 bg-slate-700 p-5 rounded-md overflow-y-auto">
        <input
          type="text"
          placeholder="Search user..."
          className="w-full py-2 px-3 rounded-md outline-0 mb-3 text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.uid}
              className={`border p-3 flex gap-x-3 items-center cursor-pointer rounded-md ${
                selectedUser?.uid === user.uid ? 'bg-gray-600' : 'bg-gray-800'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <img
                src={user.photoURL || 'default-photo-url'}
                className="rounded-full"
                alt="User Avatar"
                width={50}
              />
              <h1 className="text-xl text-white">{user.name}</h1>
            </div>
          ))
        ) : (
          <p className="text-white">No users found</p>
        )}
      </div>
      <div className="w-2/3 flex flex-col justify-between bg-gray-900 text-white p-5 rounded-md ml-5">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Chat with {selectedUser.name}</h2>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 mb-2 rounded-md ${
                    msg.sender === currentUser.uid ? 'bg-blue-600 ml-auto' : 'bg-gray-700'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  <p>{msg.text}</p>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-x-5 w-full mt-4">
              <input
                type="text"
                className="py-1 text-xl text-black px-4 outline-0 rounded-sm w-full"
                placeholder="Send Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="py-2 px-3 bg-gray-400 text-black rounded-md text-xl">
                Send
              </button>
            </form>
          </>
        ) : (
          <h2 className="text-gray-400 text-center flex-1 flex items-center justify-center">
            Select a user to start chat
          </h2>
        )}
      </div>
    </div>
       </>
  );
}
