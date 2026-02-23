import React from 'react'
import lap from '../assets/images/lap.jpg'
const Instruction = () => {
  return (
    <div className='w-full box-border flex-col px-6 py-4  mt-1'>

        <div className='w-full flex items-center gap-4'>
            <div className='flex-1 border-t-2 border-gray-300'></div>
            <p className='whitespace-nowrap font-semibold text-lg text-[40px]'>Instruction</p>
            <div className='flex-1 border-t-2 border-gray-300'></div>
        </div>


        <div className='flex gap-6 mt-6'>
            <div className='w-[50%]'>
                <img src={lap} alt="" className='w-full' />
            </div>
            <div className='w-[50%] flex flex-col justify-center'>
                <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl bg-[#03EF62] rounded-full w-10 h-10 flex items-center justify-center border-2 border-[#03EF62]'>1</p>
                        <div className='w-0.5 h-16 bg-gray-300'></div>
                    </div>
                    <div className='flex-1'>
                        <p className='font-semibold text-lg mb-1'>Create an account</p>
                        <p className='text-sm'>sign up with your email to start your journey on RIWAS</p>
                    </div>
                </div>
                <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl bg-[#03EF62] rounded-full w-10 h-10 flex items-center justify-center border-2 border-[#03EF62]'>2</p>
                        <div className='w-0.5 h-16 bg-gray-300'></div>
                    </div>
                    <div className='flex-1'>
                        <p className='font-semibold text-lg mb-1'>Browse or Post Jobs</p>
                        <p className='text-sm'>Explore opportunities or post your job openings</p>
                    </div>
                </div>
                <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl bg-[#03EF62] rounded-full w-10 h-10 flex items-center justify-center border-2 border-[#03EF62]'>3</p>
                    </div>
                    <div className='flex-1'>
                        <p className='font-semibold text-lg mb-1'>Get Hired or Hire</p>
                        <p className='text-sm'>Connect with the right talent or find your dream job</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Instruction