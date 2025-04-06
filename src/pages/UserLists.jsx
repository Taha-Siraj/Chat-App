import React, { useContext, useEffect, useState, useRef } from "react";
import Header from "./Header";
import { GlobalContext } from "./Context/Context";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where } from "firebase/firestore";
import { ClipLoader } from 'react-spinners';

const UserLists = () => {

  const { state } = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!state.user || !state.user.uid) {
      setLoading(false);
      return;
    }
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersArray.filter((user) => user.uid !== state.user.uid));
      setLoading(false); 
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [state.user]);

  useEffect(() => {
    if (!state.user || !state.user.uid || !selectedUser || !selectedUser.uid) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesArray = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) =>
          (msg.senderId === state.user.uid && msg.receiverId === selectedUser.uid) ||
          (msg.senderId === selectedUser.uid && msg.receiverId === state.user.uid)
        );
      setMessages(messagesArray);
      scrollToBottom();
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [state.user, selectedUser]);

  useEffect(() => {
    if (!state.user || !state.user.uid) return;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", state.user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        try {
          await addDoc(usersRef, {
            uid: state.user.uid,
            userName: state.user.displayName || "Anonymous",
            photoURL: state.user.photoURL || "https://via.placeholder.com/40",
            email: state.user.email || "",
            status: "online",
            lastSeen: serverTimestamp(),
          });
          console.log("User added to Firestore");
        } catch (error) {
          console.error("Error adding user:", error);
        }
      }
    }, (error) => {
      console.error("Error checking user:", error);
    });
    return () => unsubscribe();
  }, [state.user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !state.user || !state.user.uid || !selectedUser || !selectedUser.uid) {
      console.log("Cannot send message: missing data");
      return;
    }

    const messageData = {
      senderId: state.user.uid,
      receiverId: selectedUser.uid,
      text: messageText.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      setMessageText("");
      scrollToBottom();
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
         <ClipLoader size={50} color="#fff" className="mr-2" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="h-screen bg-gray-900 text-white flex font-sans">
        <div className="w-[30%] bg-gray-950 h-full overflow-y-auto border-r border-gray-700">
          <div className="py-4 px-3">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedUser?.uid === user.uid ? "bg-gray-700" : "hover:bg-gray-800"
                  }`}
                >
                  <img src={user.photoURL} alt={user.userName} className="h-10 w-10 rounded-full" />
                  <div>
                    <span className="text-lg">{user.userName}</span>
                    <p className="text-xs text-gray-400">{user.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No users available</p>
            )}
          </div>
        </div>

        <div className="w-[70%] flex flex-col justify-between">
          {selectedUser ? (
            <>
              <div className="bg-gray-800 p-4 flex items-center gap-4 border-b border-gray-700">
                <img src={selectedUser.photoURL} alt={selectedUser.userName} className="h-12 w-12 rounded-full" />
                <div>
                  <h1 className="text-xl font-semibold">{selectedUser.userName}</h1>
                  <p className="text-sm text-gray-400">{selectedUser.status}</p>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-800">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex w-full mb-3 ${msg.senderId === state.user.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[60%] p-3 rounded-lg ${msg.senderId === state.user.uid ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}>
                      <p>{msg.text}</p>
                      <span className="text-xs text-gray-300">
                        {msg.timestamp?.toDate().toLocaleTimeString() || "Sending..."}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-gray-900 flex gap-3">
                <textarea
                  className="w-full p-3 bg-gray-950 rounded-lg outline-none text-white resize-none border border-gray-700 focus:border-blue-500"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!messageText.trim() || !state.user || !selectedUser}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserLists;