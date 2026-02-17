import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaFileAlt, FaBell, FaClipboardList, FaSignOutAlt, FaEye, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  
  const [attachments, setAttachments] = useState([
    { id: 1, name: 'Eng_Mengeang_Resume.pdf', url: '/sample-resume.pdf' }
  ]);

  const [profileData, setProfileData] = useState({
    fullName: 'Eng Mengeang',
    email: 'mengeangeng@gmail.com',
    phone: '+855 987 654 321',
    role: 'Candidate',
    bio: 'Over the past 70 years as a member of the United Nations, Cambodia has actively contributed to the maintenance of international peace and security, promoted international cooperation under international law, advanced economic development, participated in interventions to resolve conflicts among member states, and helped prevent the outbreak of world wars.',
    createdAt: '21 Nov 2025'
  });

  // Complete CV data state matching your screenshots
  const [cvData] = useState({
    name: 'Eng Mengeang',
    title: 'Data Science Student Phnom Penh, Cambodia',
    contact: 'mengeang@example.com | +855 12 345 678',
    linkedin: 'LinkedIn | Portfolio',
    
    summary: 'Motivated Data Science student passionate about exploring new technologies, learning continuously, and building innovative projects. Strong problem-solving mindset and committed to improving team efficiency through research and skill development.',
    
    education: [
      {
        degree: 'Bachelor of Science in Data Science',
        institution: 'Institute of Technology of Cambodia',
        period: '2023 – Expected 2027',
        achievements: [
          'Built AI-based fitness optimization project',
          'Led Agile software development study group'
        ]
      }
    ],
    
    experience: [
      {
        title: 'Data Analyst Intern',
        company: 'TechLab Cambodia',
        period: 'June 2024 – August 2024',
        responsibilities: [
          'Analyzed datasets using Python (Pandas, NumPy)',
          'Created visual dashboards with Tableau',
          'Presented insights to improve customer engagement'
        ]
      },
      {
        title: 'Exhibition Team Member',
        company: 'University Air & Tech Show',
        period: 'October 2024 – Present',
        responsibilities: [
          'Designed and managed tech demo displays',
          'Collaborated with team to optimize visitor experience'
        ]
      }
    ],
    
    projects: [
      {
        name: 'AI for Fitness Growth',
        description: 'Developed a system for performance optimization and flexible scheduling using Python and React.',
        technologies: 'Python, Flask, React, Machine Learning',
        link: 'https://github.com/mengeang/ai-fitness-growth'
      },
      {
        name: 'Job Recommendation System',
        description: 'Built a recommendation engine that suggests jobs based on user skills and experience.',
        technologies: 'PostgreSQL, Node.js, React',
        link: 'https://github.com/mengeang/job-recommender'
      }
    ],
    
    skills: {
      softSkills: 'Teamwork, Problem Solving, Adaptability, Time Management',
      tools: 'Git, Tableau, PostgreSQL, VS Code',
      frameworks: 'React, Flask, Node.js',
      programming: 'Python, JavaScript, SQL, R'
    },
    
    certifications: [
      {
        name: 'CCNA Final Exam',
        issuer: 'Cisco Networking Academy',
        year: '2024'
      }
    ],
    
    extracurricular: [
      {
        role: 'Event Organizer',
        organization: 'High School Alumni Meeting',
        year: '2022',
        description: 'Helped organize and coordinate alumni event for grade A students.'
      }
    ],
    
    languages: [
      { name: 'Khmer', level: 'Native' },
      { name: 'English', level: 'Professional' }
    ]
  });

  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    setProfileData({ ...tempProfileData });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(false);
  };

  const handleAddAttachment = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file, index) => ({
      id: attachments.length + index + 1,
      name: file.name,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleViewAttachment = (attachment) => {
    setViewingFile(attachment);
  };

  const handleCloseViewer = () => {
    setViewingFile(null);
  };

  // Render CV content as HTML
  const renderCVContent = () => {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{cvData.name}</h1>
          <p className="text-lg text-gray-600 mb-2">{cvData.title}</p>
          <p className="text-sm text-gray-600">{cvData.contact}</p>
          <p className="text-sm text-blue-600">{cvData.linkedin}</p>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">EDUCATION</h2>
          {cvData.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-bold text-gray-900">{edu.degree}</h3>
              <p className="text-gray-700">{edu.institution}</p>
              <p className="text-sm text-gray-600 mb-2">{edu.period}</p>
              <p className="font-semibold text-gray-800">Achievements:</p>
              <ul className="list-disc list-inside text-gray-700">
                {edu.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">EXPERIENCE</h2>
          {cvData.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-bold text-gray-900">{exp.title} – {exp.company}</h3>
              <p className="text-sm text-gray-600 mb-2">{exp.period}</p>
              <ul className="list-disc list-inside text-gray-700">
                {exp.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">PROJECTS</h2>
          {cvData.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-bold text-gray-900">{project.name}</h3>
              <p className="text-gray-700 mb-1">{project.description}</p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Technologies:</span> {project.technologies}
              </p>
              <p className="text-sm text-blue-600">
                <span className="font-semibold">Link:</span> {project.link}
              </p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">SKILLS</h2>
          <table className="w-full border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="font-semibold text-gray-900 p-2 border-r border-gray-300 bg-gray-50">Soft Skills</td>
                <td className="text-gray-700 p-2">{cvData.skills.softSkills}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="font-semibold text-gray-900 p-2 border-r border-gray-300 bg-gray-50">Tools</td>
                <td className="text-gray-700 p-2">{cvData.skills.tools}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="font-semibold text-gray-900 p-2 border-r border-gray-300 bg-gray-50">Frameworks</td>
                <td className="text-gray-700 p-2">{cvData.skills.frameworks}</td>
              </tr>
              <tr>
                <td className="font-semibold text-gray-900 p-2 border-r border-gray-300 bg-gray-50">Programming</td>
                <td className="text-gray-700 p-2">{cvData.skills.programming}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certifications */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">CERTIFICATIONS</h2>
          {cvData.certifications.map((cert, index) => (
            <p key={index} className="text-gray-700">
              {cert.name} – {cert.issuer} ({cert.year})
            </p>
          ))}
        </div>

        {/* Extracurricular */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">EXTRACURRICULAR</h2>
          {cvData.extracurricular.map((activity, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold text-gray-900">{activity.role} – {activity.organization} ({activity.year})</h3>
              <p className="text-gray-700">{activity.description}</p>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">LANGUAGES</h2>
          {cvData.languages.map((lang, index) => (
            <p key={index} className="text-gray-700">
              {lang.name} – {lang.level}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {!viewingFile ? (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-medium">
                      Candidate
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{profileData.email}</p>
                  <p className="text-gray-500 text-sm">Created at {profileData.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Edit Profile Button */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={tempProfileData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profileData.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={tempProfileData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profileData.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={tempProfileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profileData.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.role}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={tempProfileData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 leading-relaxed">
                    {profileData.bio}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Attachment Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Attachment</h3>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleAddAttachment}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                    <FaPlus className="text-xs" />
                    Add new
                  </span>
                </label>
              </div>

              {attachments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No file has been added</p>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment, index) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          File {index + 1}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{attachment.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewAttachment(attachment)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          <FaEye />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Setting Section */}
            
          </div>
        </div>
      ) : (
        /* CV Viewer - Shows formatted CV content */
        <div className="p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-blue-600 text-2xl" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewingFile.name}</h2>
                  <p className="text-sm text-gray-500">Resume Document</p>
                </div>
              </div>
              <button
                onClick={handleCloseViewer}
                className="flex items-center gap-2 px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <FaTimes />
                Close
              </button>
            </div>

            {/* CV Content */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {renderCVContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
