import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import Header from "./Header"; // Assuming your Header is still relevant
import { GlobalContext } from "./Context/Context";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  where,
  updateDoc,
  doc,
  setDoc, // Import setDoc
} from "firebase/firestore";
import { ClipLoader } from 'react-spinners';
import { FaPaperPlane, FaUserCircle, FaBars } from 'react-icons/fa'; // Icons for send, default avatar, menu toggle
import { BsDot } from 'react-icons/bs'; // For online/offline status dots
import { formatDistanceToNowStrict, isToday, isYesterday, format } from 'date-fns'; // For better time formatting
import { Link } from "react-router-dom";

const UserLists = () => {
  const { state } = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar
  const db = getFirestore();
  const messagesEndRef = useRef(null); // Ref for auto-scrolling to bottom of messages
  const messageInputRef = useRef(null); // Ref for focusing message input

  // --- Utility Functions ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const getMessageTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Sending..."; // Ensure timestamp.toDate() exists
    const date = timestamp.toDate();
    if (isToday(date)) {
      return format(date, 'h:mm a'); // e.g., 9:45 PM
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a'); // e.g., Jan 1, 2024 9:45 PM
    }
  };

  const getUserStatusDisplay = (user) => {
    if (user.status === 'online') {
      return (
        <span className="flex items-center text-green-400 text-sm animate-pulse-fast">
          <BsDot className="text-xl" /> Online
        </span>
      );
    } else if (user.lastSeen && typeof user.lastSeen.toDate === 'function') { // Check for .toDate() function
      const lastSeenDate = user.lastSeen.toDate();
      const relativeTime = formatDistanceToNowStrict(lastSeenDate, { addSuffix: true });
      return (
        <span className="flex items-center text-gray-500 text-sm">
          <BsDot className="text-xl" /> Last seen {relativeTime}
        </span>
      );
    }
    return (
      <span className="flex items-center text-gray-500 text-sm">
        <BsDot className="text-xl" /> Offline
      </span>
    );
  };

  // --- Firebase Listeners & Effects ---

  // Effect to manage user online/offline status in Firestore
  useEffect(() => {
    if (!state.user || !state.user.uid) return;

    const userDocRef = doc(db, "users", state.user.uid);
    // Use setDoc with merge:true to create or update the document
    const setOnline = async () => {
      try {
        await setDoc(userDocRef, {
          uid: state.user.uid,
          userName: state.user.displayName || "Anonymous",
          photoURL: state.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user.uid}`,
          email: state.user.email || "",
          status: "online",
          lastSeen: serverTimestamp(),
        }, { merge: true }); // Use merge: true to avoid overwriting existing data
        console.log(`User ${state.user.uid} set to online.`);
      } catch (e) {
        console.error("Error setting online status or creating user document:", e);
      }
    };

    const setOffline = async () => {
      if (!state.user || !state.user.uid) return;
      try {
        // Only update status and lastSeen if the document exists
        // Attempting to update a non-existent document will still throw an error if not caught
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          await updateDoc(userDocRef, {
            status: "offline",
            lastSeen: serverTimestamp(),
          });
          console.log(`User ${state.user.uid} set to offline.`);
        } else {
          console.warn(`User document for ${state.user.uid} not found, cannot set offline status.`);
        }
      } catch (e) {
        console.error("Error setting offline status:", e);
      }
    };

    setOnline(); // Set online when component mounts

    window.addEventListener('beforeunload', setOffline);
    return () => {
      window.removeEventListener('beforeunload', setOffline);
      setOffline(); // Ensure offline status is set on unmount
    };
  }, [state.user, db]); // useCallback is not needed here as db and state.user are stable enough

  // Fetch all users for the sidebar
  useEffect(() => {
    if (!state.user || !state.user.uid) {
      setLoading(false);
      return;
    }
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Filter out current user, sort by online status then last seen/alphabetically
      const filteredAndSortedUsers = usersArray
        .filter((user) => user.uid !== state.user.uid)
        .sort((a, b) => {
          // Check if lastSeen is a Timestamp before calling toDate()
          const aLastSeen = a.lastSeen && typeof a.lastSeen.toDate === 'function' ? a.lastSeen.toDate().getTime() : 0;
          const bLastSeen = b.lastSeen && typeof b.lastSeen.toDate === 'function' ? b.lastSeen.toDate().getTime() : 0;

          if (a.status === 'online' && b.status !== 'online') return -1;
          if (a.status !== 'online' && b.status === 'online') return 1;

          if (aLastSeen && bLastSeen) {
            return bLastSeen - aLastSeen; // Most recent first
          }
          return a.userName.localeCompare(b.userName); // Alphabetical fallback
        });
      setUsers(filteredAndSortedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [state.user, db]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!state.user || !state.user.uid || !selectedUser || !selectedUser.uid) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "messages");
    const chatUsers = [state.user.uid, selectedUser.uid].sort(); // Sort to create a consistent chat ID
    const chatQuery = query(
      messagesRef,
      orderBy("timestamp", "asc"),
      where("chatId", "==", chatUsers.join('_')) // Use a combined chat ID for more efficient query
    );

    // Optional: If you don't want to use a `chatId` field, use the more complex query but it's less efficient
    // const q = query(
    //   messagesRef,
    //   orderBy("timestamp", "asc"),
    //   where("senderId", "in", [state.user.uid, selectedUser.uid]),
    //   where("receiverId", "in", [state.user.uid, selectedUser.uid])
    // );


    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
        // If using the simpler `chatId` field, no further filter is needed here
        const currentChatMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(currentChatMessages);
        scrollToBottom();
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [state.user, selectedUser, db]); // useCallback is not needed here

  // Auto-scroll to bottom when messages load/update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // --- Message Sending Logic ---
  const sendMessage = async () => {
    if (!messageText.trim() || !state.user || !state.user.uid || !selectedUser || !selectedUser.uid) {
      console.log("Cannot send message: missing data");
      return;
    }

    const chatUsers = [state.user.uid, selectedUser.uid].sort(); // Consistent ID for the chat
    const messageData = {
      senderId: state.user.uid,
      receiverId: selectedUser.uid,
      chatId: chatUsers.join('_'), // Add a chat ID to the message for easier querying
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      read: false, // Optional: for read receipts
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      setMessageText("");
      if (messageInputRef.current) {
        messageInputRef.current.focus(); // Keep input focused
      }
      // scrollToBottom() is already called by the onSnapshot listener, so no need to call it here again immediately
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

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <ClipLoader size={60} color="#6366F1" /> {/* Larger, more vibrant loader */}
        <p className="ml-4 text-xl font-semibold">Loading chat...</p>
      </div>
    );
  }

  if (!state.user || !state.user.uid) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <FaUserCircle className="text-6xl text-gray-500 mb-4 animate-bounce-slow" />
        <h1 className="text-3xl font-bold mb-3">Authentication Required</h1>
        <p className="text-lg text-gray-400 mb-6">Please log in to access the chat application.</p>
        
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <Header /> {/* Your global header */}
      <div className="flex h-screen overflow-hidden bg-gray-900 text-white font-sans pt-16"> {/* Adjust pt- to account for Header height */}

        {/* Mobile Sidebar Toggle Button */}
        <button
          className="lg:hidden absolute top-4 left-4 z-50 p-3 bg-gray-800 rounded-full shadow-lg text-white hover:bg-gray-700 transition-colors duration-200"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle user list sidebar"
        >
          <FaBars className="text-xl" />
        </button>

        {/* User List Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-gray-950 h-full border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="py-5 px-4">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3">Active Chats</h2>
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => {
                    setSelectedUser(user);
                    setSidebarOpen(false); // Close sidebar on user selection in mobile
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 mb-3 group ${
                    selectedUser?.uid === user.uid ? "bg-indigo-700 shadow-lg" : "hover:bg-gray-800"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`} // Dynamic avatar placeholder
                      alt={user.userName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-700 group-hover:border-indigo-500 transition-colors duration-300"
                    />
                    {/* Online/Offline Dot Indicator */}
                    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-950 ${user.status === 'online' ? 'bg-green-500 animate-pulse-dot' : 'bg-gray-500'}`}></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white truncate max-w-[120px]">{user.userName}</h3>
                    {getUserStatusDisplay(user)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-10">No other users found.</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-l-2xl shadow-xl z-30 ml-auto lg:ml-0">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between shadow-md z-20">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedUser.uid}`}
                    alt={selectedUser.userName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-white">{selectedUser.userName}</h1>
                    {getUserStatusDisplay(selectedUser)}
                  </div>
                </div>
                {/* Potentially add call/video call icons here */}
              </div>

              {/* Message Display Area */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-800">
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isSender = msg.senderId === state.user.uid;
                    const prevMsg = messages[index - 1];
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId || (msg.timestamp && prevMsg.timestamp && Math.abs(msg.timestamp.toDate().getTime() - prevMsg.timestamp.toDate().getTime()) > 60000); // Show avatar if sender changes or message is old
                    return (
                      <div
                        key={msg.id}
                        className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        {!isSender && showAvatar && (
                          <img
                            src={selectedUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedUser.uid}`}
                            alt={selectedUser.userName}
                            className="h-9 w-9 rounded-full object-cover mr-3 self-end shadow-md animate-fade-in"
                          />
                        )}
                        <div className={`flex flex-col max-w-[70%] lg:max-w-[50%] animate-fade-in-up-message ${isSender ? "items-end" : "items-start"}`}>
                          <div className={`p-4 rounded-xl shadow-md break-words transition-all duration-300 ease-in-out ${
                            isSender ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-700 text-white rounded-bl-none"
                          }`}>
                            <p className="text-base leading-relaxed">{msg.text}</p>
                          </div>
                          <span className={`text-xs text-gray-400 mt-1 ${isSender ? "text-right" : "text-left"}`}>
                            {getMessageTimestamp(msg.timestamp)}
                          </span>
                        </div>
                        {isSender && showAvatar && (
                          <img
                            src={state.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${state.user.uid}`}
                            alt={state.user.displayName}
                            className="h-9 w-9 rounded-full object-cover ml-3 self-end shadow-md animate-fade-in"
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-lg">
                    <p className="mb-4">No messages yet. Say hello!</p>
                    <FaPaperPlane className="text-4xl text-gray-600" />
                  </div>
                )}
                <div ref={messagesEndRef} className="pt-2"></div> {/* Invisible div for scrolling */}
              </div>

              {/* Message Input Area */}
              <div className="p-4 bg-gray-900 border-t border-gray-700 flex items-center gap-4 shadow-top z-20">
                <textarea
                  ref={messageInputRef}
                  className="flex-1 p-4 bg-gray-950 rounded-2xl outline-none text-white resize-none border border-gray-700 focus:border-indigo-500 transition-colors duration-200 custom-scrollbar-thin"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  rows={1}
                  style={{ maxHeight: '120px' }} // Limit textarea height
                />
                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  disabled={!messageText.trim() || !state.user || !selectedUser}
                  aria-label="Send message"
                >
                  <FaPaperPlane className="text-xl" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-2xl p-4 text-center">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-chat-6242314-5178657.png?f=webp" alt="Select chat" className="w-64 h-64 mb-6 object-contain animate-bounce-slow" />
              <p className="mb-2">Start a new conversation!</p>
              <p className="text-lg">Select a user from the left sidebar to begin chatting.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tailwind CSS Custom Animations (add to tailwind.config.js) */}
      <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes fade-in-up-message {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-pulse-fast {
          animation: pulse-fast 1.5s infinite;
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.5s infinite;
        }
        .animate-fade-in-up-message {
          animation: fade-in-up-message 0.3s ease-out;
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }

        /* Custom Scrollbar for messages and textarea */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #666;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #888;
        }

        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #1a202c; /* bg-gray-950 */
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4a5568; /* darker gray */
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </>
  );
};

export default UserLists;