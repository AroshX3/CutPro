import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Cutting from './components/Cutting/Cutting'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar/>
      <Cutting/>
      <Footer/>
    </>
  )
}

export default App
