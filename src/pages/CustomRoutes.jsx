import React from 'react'
import Login from './Login'
import Signup from './Signup'
import { Routes , Route } from 'react-router-dom'
import Chatdashbord from './Chatdashbord'

const CustomRoutes = () => {

  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/Chatdashbord' element={<Chatdashbord/>} />
      </Routes>
    </div>
  )
}

export default CustomRoutes
