import React from 'react'
import HomeNav from '../components/HomeNav.jsx'
import HomeContent from '../components/HomeContent.jsx'
const Home = () => {
  return (
    <div className="box-border w-full h-full">
        <HomeNav />
        <HomeContent/>
    </div>
  )
}

export default Home