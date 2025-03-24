import React, { useContext } from 'react'
import Login from './Login'
import Signup from './Signup'
import { Routes , Route } from 'react-router-dom'
import Chatdashbord from './Chatdashbord'
import { GlobalContext } from './Context/Context'

const CustomRoutes = () => {

  const { state } = useContext(GlobalContext);

  return (
    <div>
      <Routes>
    <Route path='/login' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    <Route path='/Chatdashbord' element={<Chatdashbord/>} />
     </Routes> 
      {/* {state.isLogin === true  ?
    <Routes>
    <Route path='/login' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    <Route path='/Chatdashbord' element={<Chatdashbord/>} />
     </Routes> 
      :
      state.isLogin === false ?
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
      </Routes>  
       :
       null 
    }
       */}
    </div>
  )
}

export default CustomRoutes
