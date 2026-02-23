import { useState, React} from "react";
import { NavLink } from "react-router-dom";
import logo from '../assets/images/logo.png';
import { FaTachometerAlt, FaBriefcase, FaClipboardList, FaUsers } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
let menuItems = [
  {
    path: '/profile-page',
    icon: <CgProfile />,
    label: 'Profile'
  },
  {
    path: '/dashboard',
    icon: <FaTachometerAlt />,
    label: 'Dashboard'
  },
  {
    path: '/job-listing',
    icon: <FaBriefcase />,
    label: 'Job Postings'
  },
  {
    path: '/manage-application',
    icon: <FaClipboardList />,
    label: 'Manage Application'
  },
  {
    path: '/candidate-information',
    icon: <FaUsers />,
    label: 'Candidate Information'
  }
]

export function SideBar() {
  const [isOpen, setIsOpen] = useState(0);
  return (
    <>
      {/* Header */}
      <aside className="w-[227px] bg-white h-screen fixed top-0 left-0 shadow-xl">
        <div className="p-6">
          <img src={logo} alt="Logo" className="w-32 h-auto" />
        </div>
        {/* Menu Items */}
        <nav className="px-[12px] mt-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>`flex items-center space-x-6 px-4 py-4 rounded-[15px] w-[202px] h-[50px] text-[14px] font-medium
                  ${isActive 
                    ? 'bg-[#03EF62] text-black text-bold' 
                    : 'text-black opacity-70 hover:text-green-500 hover:bg-green-100'}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default SideBar;