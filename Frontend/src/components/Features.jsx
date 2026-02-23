import React from 'react'
import dashboard from '../assets/images/dashboard.jpg'
import jobposting from '../assets/images/jobposting.jpg'
import cvautomate from '../assets/images/cvautomate.jpg'
import { Link } from "react-router-dom";
const Features = () => {
  return (
    <div className='w-full box-border flex-col px-6 py-4  mt-1'>

        <div className='w-full flex items-center gap-4'>
            <div className='flex-1 border-t-2 border-gray-300'></div>
            <p className='whitespace-nowrap font-semibold text-lg text-[40px]'>Our features</p>
            <div className='flex-1 border-t-2 border-gray-300'></div>
        </div>

        <div>
            <Link to="/about" className="px-6 py-3 mt-4 font-semibold bg-[#03EF62] rounded-l-[10px] inline-block w-[170px] border-2 border-[#03EF62] text-white">HR</Link>
            <Link to="/about" className="px-6 py-3 mr-4 mt-4 font-semibold border-2 border-[#E9E9E9]/50 text-[#000000]/50 rounded-r-[10px] inline-block w-[170px]">Candidate</Link>
        </div>

        <div className='flex gap-6 mt-6'>
            <div className='flex-1 flex flex-col'>
                <img src={dashboard} alt="" className='mb-3 max-w-[150px] mx-auto' />
                <p className='font-semibold text-lg mb-2 text-center'>Dashboard</p>
                <p className='text-xs text-center'>Provides an overview of total job posts, <br /> candidates, 
                and application status updates <br /> in one place.</p>
            </div>
            <div className='flex-1 flex flex-col'>
                <img src={jobposting} alt="" className='mb-3 max-w-[150px] mx-auto' />
                <p className='font-semibold text-lg mb-2 text-center'>Job Posting</p>
                <p className='text-xs text-center'>Provides an overview of total job posts, <br /> candidates, 
                and application status updates in one place.</p>
            </div>
            <div className='flex-1 flex flex-col'>
                <img src={cvautomate} alt="" className='mb-3 max-w-[150px] mx-auto' />
                <p className='font-semibold text-lg mb-2 text-center'>CV Automation</p>
                <p className='text-xs text-center'>Provides an overview of total job posts, candidates, 
                and <br /> application status updates in one place.</p>
            </div>
        </div>
    </div>
  )
}

export default Features