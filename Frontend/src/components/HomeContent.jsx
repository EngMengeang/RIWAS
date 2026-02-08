import React from 'react'
import home from "../assets/images/home.png";
const HomeContent = () => {
  return (
    <div className='w-full box-border flex justify-between px-6 py-4'>
        <div className='grow'>
            <p className='font-bold text-[48px] '>
                Connecting talents with opportunity
            </p>
            <p className='text-[15px]'>
                At RIWAS, we make hiring simple, smart, and fast.
                Whether you're an employer searching for the perfect
                candidate or a job seeker ready to take the next step in your career — 
                we've got you covered.
            </p>
        </div>
        <div className='grow-[2]'>
            <img src={home} alt="" />
        </div>
    </div>
  )
}

export default HomeContent