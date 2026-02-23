import React, { useState } from 'react';

const CVPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Experience
    experience: [
      {
        position: 'Data Analyst Intern',
        company: 'TechLab Cambodia',
        startDate: '01/06/2024',
        endDate: '01/08/2024',
        description: 'Data Analyst Intern – TechLab Cambodia (June 2024 – August 2024)\n1. Analyzed datasets using Python (Pandas, NumPy)\n2. Created visual dashboards with Tableau 3 Presented insights to improve customer engagement'
      }
    ],
    
    // Projects
    projects: [
      'AI for Fitness Growth – Developed a system for performance optimization and flexible scheduling using Python and React.',
      'Job Recommendation System – Built a recommendation engine that suggests jobs based on user skills and experience.'
    ],
    
    // Skills
    programming: 'Python, JavaScript, R',
    frameworks: 'React, Flask, Node.js',
    tools: 'Tableau, Git, VS Code',
    softSkills: 'Teamwork, Problem Solving, Time Management',
    
    // Certifications
    certifications: [
      'CCNA Final Exam – Cisco Networking Academy (2024)'
    ],
    
    // Extracurricular Activities
    extracurricular: {
      role: 'Event Organizer',
      organization: 'High School Alumni Meeting',
      year: 'Event 2022',
      description: 'Helped organize and coordinate alumni event for grade A students.'
    },
    
    // Languages
    languages: [
      { language: 'Khmer', level: 'Native or bilingual proficiency' },
      { language: 'English', level: 'Native or bilingual proficiency' }
    ]
  });

  const handleChange = (section, index, field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (Array.isArray(newData[section])) {
        newData[section] = [...newData[section]];
        if (typeof newData[section][index] === 'object') {
          newData[section][index] = { ...newData[section][index], [field]: value };
        } else {
          newData[section][index] = value;
        }
      } else if (typeof newData[section] === 'object' && !Array.isArray(newData[section])) {
        newData[section] = { ...newData[section], [field]: value };
      } else {
        newData[section] = value;
      }
      
      return newData;
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit My CV' : 'My Resume / CV'}
          </h1>
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                Edit Resume
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Experience</h2>
          
          {formData.experience.map((exp, index) => (
            <div key={index} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={exp.position}
                    onChange={(e) => handleChange('experience', index, 'position', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={exp.company}
                    onChange={(e) => handleChange('experience', index, 'company', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={exp.startDate}
                    onChange={(e) => handleChange('experience', index, 'startDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="01/06/2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={exp.endDate}
                    onChange={(e) => handleChange('experience', index, 'endDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="01/08/2024"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  disabled={!isEditing}
                  value={exp.description}
                  onChange={(e) => handleChange('experience', index, 'description', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Projects</h2>
          
          {formData.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project {index + 1}
              </label>
              <textarea
                disabled={!isEditing}
                value={project}
                onChange={(e) => handleChange('projects', index, null, e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Skills</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.programming}
                onChange={(e) => handleChange('programming', null, null, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frameworks
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.frameworks}
                onChange={(e) => handleChange('frameworks', null, null, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tools
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.tools}
                onChange={(e) => handleChange('tools', null, null, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soft-skill
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.softSkills}
                onChange={(e) => handleChange('softSkills', null, null, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Certifications</h2>
          
          {formData.certifications.map((cert, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                disabled={!isEditing}
                value={cert}
                onChange={(e) => handleChange('certifications', index, null, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        {/* Extracurricular Activities Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Extracurricular Activities</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.extracurricular.role}
                onChange={(e) => handleChange('extracurricular', null, 'role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.extracurricular.organization}
                onChange={(e) => handleChange('extracurricular', null, 'organization', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.extracurricular.year}
              onChange={(e) => handleChange('extracurricular', null, 'year', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              disabled={!isEditing}
              value={formData.extracurricular.description}
              onChange={(e) => handleChange('extracurricular', null, 'description', e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Languages Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Languages</h2>
          
          {formData.languages.map((lang, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language {index + 1}
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={lang.language}
                  onChange={(e) => handleChange('languages', index, 'language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={lang.level}
                  onChange={(e) => handleChange('languages', index, 'level', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CVPage;
