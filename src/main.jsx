import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ContextProvider from './pages/Context/Context.jsx'

createRoot(document.getElementById('root')).render(
  
  <ContextProvider>
  <BrowserRouter>
    <App />
   </BrowserRouter>
  </ContextProvider>

)
