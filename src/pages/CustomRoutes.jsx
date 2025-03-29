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
    {(state.user === false)? (
      <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/userlist' element={<UserList/>} />
      </Routes>
    ):(state.user === false)? (
      <Routes>
    <Route path='/' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    </Routes>
    )
    : <Routes>
    <Route path='/' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    </Routes> 
  }
    </div>
  )
}

export default CustomRoutes
