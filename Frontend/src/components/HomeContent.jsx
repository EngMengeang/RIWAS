import React from 'react'
import home from "../assets/images/home.png";
import { Link } from "react-router-dom";
const HomeContent = () => {
  return (
    <div className='w-full h-screen box-border flex px-6 py-4 justify-items-center items-center mt-1'>
        <div className='w-[50%]'>
            <p className='font-bold text-[48px] '>
                Connecting talents with opportunity
            </p>
            <p className='text-[15px]'>
                At RIWAS, we make hiring simple, smart, and fast.
                Whether you're an employer searching for the perfect
                candidate or a job seeker ready to take the next step in your career — 
                we've got you covered.
            </p>

            <Link to="/about" className="px-6 py-3 mr-4 mt-4 font-semibold border-2 border-[#03EF62] rounded-[25px] inline-block">Browse jobs</Link>
            <Link to="/about" className="px-6 py-3 mt-4 font-semibold bg-[#03EF62] rounded-[25px] inline-block">Get Started</Link>
        </div>
       
        <div className='w-[50%]'>
            <img src={home} alt="" />
        </div>
       
    </div>
  )
}

export default HomeContent