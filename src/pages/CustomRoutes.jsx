import React from 'react'
import Login from './Login'
import Signup from './Signup'
import { Routes , Route } from 'react-router-dom'

const CustomRoutes = () => {

  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
      </Routes>
    </div>
  )
}

export default CustomRoutes
