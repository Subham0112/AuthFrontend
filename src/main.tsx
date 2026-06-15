import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import UserContext from './context/userContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserContext>
     
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </UserContext>
  </StrictMode>
)

