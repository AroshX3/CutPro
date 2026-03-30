import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Cutting from './components/Cutting/Cutting'
import About from './components/About/About'

function App() {

  return (
    <>
      <Cutting/>
      <About/>
    </>
  )
}

export default App
