import React, { useContext } from 'react'
import Login from './Login'
import Signup from './Signup'
import { Routes , Route } from 'react-router-dom'
import { GlobalContext } from './Context/Context'
import UserProfile from './UserProfile'
import UserList from './UserLists'
const CustomRoutes = () => {
  const { state } = useContext(GlobalContext);

  return (
    <div>
      
      <Routes>
    <Route path='/' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    <Route path='/userlist' element={<UserList/>} />
    <Route path='/Userprofile' element={<UserProfile/>} />
     </Routes>
    </div>
  )
}

export default CustomRoutes
