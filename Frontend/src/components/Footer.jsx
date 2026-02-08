import React from 'react';
import { Github, MessageCircle, Send } from 'lucide-react';
import biglogo from '../assets/images/biglogo.png'
const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-gray-300">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="flex items-start">
            <div className="flex items-center gap-2">
              <img src={biglogo} alt="" />
            </div>
          </div>

          {/* Team Collaborate Section */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4">Team Collaborate</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Google Meet
                </a>
              </li>
            </ul>
          </div>

          {/* Get in Touch Section */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4">Get in touch</h3>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-blue-400 hover:text-blue-500 transition-colors"
                aria-label="Telegram"
              >
                <Send size={24} />
              </a>
            </div>
          </div>
          {/* Useful Links Section */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Home Page
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Our Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Instruction
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Our Story
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Green Bottom Bar */}
      <div className="bg-green-500 h-8"></div>
    </footer>
  );
};

export default Footer;