import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaFacebook, FaTelegram } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RIWAS" className="h-8" />
            <span className="text-xl font-bold"></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-green-500 transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-green-500 transition-colors">
              About us
            </a>
            <Link
              to="/signup"
              className="bg-green-500 text-white px-6 py-2.5 rounded-full hover:bg-green-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Connecting talents with opportunity
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                At RIWAS, we make hiring simple, smart, and fast. Whether you're an employer
                searching for the perfect candidate or a job seeker ready to take the next step
                in your career — we've got you covered.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="border-2 border-green-500 text-green-500 px-8 py-3 rounded-full hover:bg-green-50 transition-all font-medium"
                >
                  Browse jobs
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition-all hover:-translate-y-0.5 hover:shadow-lg font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>

            
           {/* Right Illustration */}
            <div className="flex-1 flex justify-center items-center">
              <div className="relative w-full max-w-2xl">
                <img
                  src="/public.png"
                  alt="illustration"
                  className="w-full h-auto"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Our features</h2>
          
          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button className="px-8 py-3 bg-white text-gray-600 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              HR
            </button>
            <button className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Candidate
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Easy Apply */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Easy Apply</h3>
              <p className="text-gray-600 leading-relaxed">
                Simple and fast application process with CV upload and auto-filled details.
              </p>
            </div>

            {/* Status Tracking */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Status Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                View the current stage of each application and track changes made by HR.
              </p>
            </div>

            {/* Job History */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-50 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Job History</h3>
              <p className="text-gray-600 leading-relaxed">
                Keep record of all applied jobs and manage or revisit previous applications anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instruction Section */}
      <section id="about" className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Instruction</h2>
          
          <div className="flex flex-col lg:flex-row items-center gap-19">
            {/* Left - Laptop Mockup */}
           
            <div className="flex-1">
            <div className="relative w-full flex justify-center">
              <div className="relative w-[90%] max-w-5xl">
                <div className="bg-gray-900 rounded-t-3xl p-6 shadow-2xl">
                  <img
                    src="/laptop-mockup.png"
                    alt="Laptop Screen"
                    className="w-full max-h-[500px] object-contain"
                  />
                </div>
                <div className="mx-auto h-5 bg-gray-800 rounded-b-3xl w-2/3 shadow-xl" />
              </div>
            </div>
          </div>


            {/* Right - Steps */}
            <div className="flex-1 space-y-8">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-green-500">Create an account</h3>
                  <p className="text-gray-600">
                    Sign up with your email to start your journey on RIWAS.
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-gray-300 h-8 ml-6"></div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-green-500">Browse for jobs</h3>
                  <p className="text-gray-600">
                    Explore hundreds of job opportunities that match your skills and interests.
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-gray-300 h-8 ml-6"></div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-green-500">Apply for jobs</h3>
                  <p className="text-gray-600">
                    Submit your application quickly and let employers discover you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="RIWAS" className="h-8" />
              
              </div>
            </div>

            {/* Team Collaborate */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Team Collaborate</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-green-500 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Google Meet</a></li>
              </ul>
            </div>

            {/* Get in touch */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Get in touch</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-green-500 transition-colors">
                  <FaGithub size={24} />
                </a>
                <a href="#" className="text-gray-600 hover:text-green-500 transition-colors">
                  <FaFacebook size={24} />
                </a>
                <a href="#" className="text-gray-600 hover:text-green-500 transition-colors">
                  <FaTelegram size={24} />
                </a>
              </div>
            </div>

            {/* Useful Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Useful Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-green-500 transition-colors">Home Page</a></li>
                <li><a href="#features" className="hover:text-green-500 transition-colors">Our Features</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Instruction</a></li>
                <li><a href="#about" className="hover:text-green-500 transition-colors">Our Story</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600 text-sm">
            <p>© 2026 RIWAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
