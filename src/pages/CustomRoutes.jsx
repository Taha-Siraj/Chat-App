
import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalContext } from './Context/Context';
import Login from './Login';
import Signup from './Signup';
import UserList from './UserLists';
import Home from './Home';
import Userprofile from './Userprofile';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EditProfile from './EditProfile';

const CustomRoutes = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const auth = getAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
   
        dispatch({ type: 'USER_LOGIN', payload: user });
      } else {
    
        dispatch({ type: 'USER_LOGOUT' });
      }
      setAuthCheckComplete(true); 
    });

    return () => unsubscribe(); 
  }, [auth, dispatch]);


  if (!authCheckComplete) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-xl">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editprofile" element={<EditProfile />} />
      <Route path="/login" element={state.user ? <Navigate to="/userlist" replace /> : <Login />} />
      <Route path="/signup" element={state.user ? <Navigate to="/userlist" replace /> : <Signup />} />
      {state.user ? (
        <>
          <Route path="/userlist" element={<UserList />} />
          <Route path="/userprofile" element={<Userprofile />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (

        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default CustomRoutes;