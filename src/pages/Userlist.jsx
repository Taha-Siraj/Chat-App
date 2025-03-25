import { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs } from "firebase/firestore";
import Header from './Header';
import { GlobalContext } from './Context/Context';

export default function UserList() {
    const [users, setUsers] = useState([]); 
    const [search, setSearch] = useState(""); 
    const [selectedUser, setSelectedUser] = useState(null); 
    const { state, dispatch } = useContext(GlobalContext);
    const db = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch({ type: 'USER_LOGIN', payload: user });
            } else {
                dispatch({ type: 'USER_LOGOUT' });
            }
        });
        unsubscribe();
        return () => unsubscribe();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "Chats"));
            let tempUsers = [];
            querySnapshot.forEach((doc) => {
                tempUsers.push(doc.data());
            });
            setUsers(tempUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }

    };

    useEffect(() => {
        fetchUsers();
    }, []);
    const addUser = async () => {
        try {
            await addDoc(collection(db, "Chats"), {
                name: state?.user?.displayName || "Unknown",
                email: state?.user?.email || "No Email",
                photoURL: state?.user?.photoURL || "",
                lastSeen: new Date(),
                uid: state?.user?.uid || "",
                online: true,
            });

            fetchUsers(); 
        } catch (e) {
            console.error("Error adding user: ", e);
        }
    };
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className='flex  py-4  px-4  justify-center'>
                
                <div className='w-1/3 bg-slate-700 p-5 rounded-md'>
                    <input
                        type="text"
                        placeholder='Search user...'
                        className='w-full py-2 px-3 rounded-md outline-0 mb-3'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <div
                                key={index}
                                className={`border p-3 flex gap-x-3 items-center cursor-pointer rounded-md 
                                    ${selectedUser?.uid === user.uid ? 'bg-gray-600' : 'bg-gray-800'}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <img src={user.photoURL} className='rounded-full' alt="" width={50} />
                                <h1 className='text-xl text-white'>{user.name}</h1>
                            </div>
                        ))
                    ) : (
                        <p className="text-white">No users found</p>
                    )}
                </div>
                <div className='w-2/3 flex flex-col justify-between items-center bg-gray-900 text-white p-5 rounded-md ml-5 '>
                    {selectedUser ? (
                        <div>
                            <h2 className='text-2xl font-bold'>Chat with {selectedUser.name}</h2>
                        </div>
                    ) : (
                        <h2 className='text-gray-400 text-center'>Select a user to start chat</h2>
                    )}

                   <form className='flex gap-x-5 w-full'>
                   <input type="text" className='py-1 text-xl text-black  px-4 outline-0 rounded-sm w-full ' placeholder='Sent Message'  />
                   <button className='py2 px-3 bg-gray-400 text-black rounded-md text-xl'>Sent SMS</button>
                   </form>
                </div>
            </div>
        </>
    );
}
