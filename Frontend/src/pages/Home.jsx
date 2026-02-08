import React from 'react'
import HomeNav from '../components/HomeNav.jsx'
import HomeContent from '../components/HomeContent.jsx'
import Features from '../components/Features.jsx'
import Instruction from '../components/Instruction.jsx'
import Footer from '../components/Footer.jsx'
const Home = () => {
  return (
    <div className="flex-col box-border w-screen h-screen">
        <HomeNav />
        <HomeContent/>
        <Features />  
        <Instruction />
        <Footer />
    </div>
  )
}

export default Home