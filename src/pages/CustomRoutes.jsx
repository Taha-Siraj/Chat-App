import React, { useContext } from 'react'
import Login from './Login'
import Signup from './Signup'
import { Routes , Route } from 'react-router-dom'
import { GlobalContext } from './Context/Context'
import UserList from './UserLists'
const CustomRoutes = () => {
  const { state } = useContext(GlobalContext);

  return (
    <div>
      
    <Routes>
    <Route path='/' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    <Route path='/userlist' element={<UserList/>} />
    </Routes>
    </div>
  )
}

export default CustomRoutes
