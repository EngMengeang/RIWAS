import React, { useState } from 'react'
import biglogo from '../../assets/images/biglogo.png'
import { Upload, FileText, CheckCircle } from 'lucide-react'

const InputResume = () => {
  const [resume, setResume] = useState(null)
  const [coverLetter, setCoverLetter] = useState(null)

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      if (type === 'resume') {
        setResume(file)
      } else {
        setCoverLetter(file)
      }
    } else {
      alert('Please upload a PDF file only')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!resume && !coverLetter) {
      alert('Please upload at least one document')
      return
    }
    console.log('Resume:', resume)
    console.log('Cover Letter:', coverLetter)
    // Handle file upload here
  }

  return (
    <div className='flex box-border w-screen h-screen items-center'>
        <div className='w-[50%] h-full border-r border-[#03EF62] flex items-center justify-center'>
            <img src={biglogo} alt="" className='max-w-[300px]' />
        </div>
        <div className='w-[50%] h-full flex items-center justify-center px-12'>
            <div className='w-full max-w-md'>
                <h2 className='text-3xl font-bold mb-2'>Upload Your Documents</h2>
                <p className='text-gray-600 mb-8'>Please upload your resume and cover letter in PDF format</p>
                
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Resume Upload */}
                    <div>
                        <label className='block text-sm font-semibold mb-2'>
                            Resume <span className='text-gray-400'>(Optional)</span>
                        </label>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#03EF62] transition-colors'>
                            <input
                                type='file'
                                accept='.pdf'
                                onChange={(e) => handleFileChange(e, 'resume')}
                                className='hidden'
                                id='resume-upload'
                            />
                            <label htmlFor='resume-upload' className='cursor-pointer flex flex-col items-center'>
                                {resume ? (
                                    <>
                                        <CheckCircle className='text-[#03EF62] mb-2' size={40} />
                                        <p className='text-sm font-medium text-gray-700'>{resume.name}</p>
                                        <p className='text-xs text-gray-500 mt-1'>{(resume.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className='text-gray-400 mb-2' size={40} />
                                        <p className='text-sm text-gray-600'>Click to upload resume</p>
                                        <p className='text-xs text-gray-400 mt-1'>PDF files only</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Cover Letter Upload */}
                    <div>
                        <label className='block text-sm font-semibold mb-2'>
                            Cover Letter <span className='text-gray-400'>(Optional)</span>
                        </label>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#03EF62] transition-colors'>
                            <input
                                type='file'
                                accept='.pdf'
                                onChange={(e) => handleFileChange(e, 'coverLetter')}
                                className='hidden'
                                id='cover-letter-upload'
                            />
                            <label htmlFor='cover-letter-upload' className='cursor-pointer flex flex-col items-center'>
                                {coverLetter ? (
                                    <>
                                        <CheckCircle className='text-[#03EF62] mb-2' size={40} />
                                        <p className='text-sm font-medium text-gray-700'>{coverLetter.name}</p>
                                        <p className='text-xs text-gray-500 mt-1'>{(coverLetter.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className='text-gray-400 mb-2' size={40} />
                                        <p className='text-sm text-gray-600'>Click to upload cover letter</p>
                                        <p className='text-xs text-gray-400 mt-1'>PDF files only</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        className='w-full bg-[#03EF62] text-white font-semibold py-3 rounded-lg hover:bg-[#02d557] transition-colors'
                    >
                        Submit Documents
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default InputResume