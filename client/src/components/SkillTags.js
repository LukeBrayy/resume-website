import React from 'react';
import { Tag } from 'lucide-react';

const skillCategories = [
  {
    name: 'Languages',
    color: 'bg-blue-500',
    skills: [
      { name: 'Python', link: 'https://www.python.org/' },
      { name: 'JavaScript', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'Java', link: 'https://www.java.com/' },
      { name: 'VBA', link: 'https://docs.microsoft.com/en-us/office/vba/library-reference/concepts/getting-started-with-vba-in-office' },
    ]
  },
  {
    name: 'Frameworks & Libraries',
    color: 'bg-green-500',
    skills: [
      { name: 'Flask', link: 'https://flask.palletsprojects.com/' },
      { name: 'uWSGI', link: 'https://uwsgi-docs.readthedocs.io/' },
      { name: 'GPT Tools', link: 'https://openai.com/blog/openai-api/' },
      { name: 'React', link: 'https://reactjs.org/' },
      { name: 'Node.js', link: 'https://nodejs.org/' },
      { name: 'Express', link: 'https://expressjs.com/' }
    ]
  },
  {
    name: 'Tools & Technologies',
    color: 'bg-purple-500',
    skills: [
      { name: 'Docker', link: 'https://www.docker.com/' },
      { name: 'AWS', link: 'https://aws.amazon.com/' },
      { name: 'GCP', link: 'https://cloud.google.com/' },
      { name: 'Linux sysadmin', link: 'https://www.linux.org/' },
      { name: 'Nginx', link: 'https://www.nginx.com/' },
      { name: 'Git', link: 'https://git-scm.com/' },
    ]
  },
  {
    name: 'Databases',
    color: 'bg-red-500',
    skills: [
      { name: 'ElasticSearch', link: 'https://www.elastic.co/' },
      { name: 'SQLite', link: 'https://www.sqlite.org/' },
      { name: 'MySQL', link: 'https://www.mysql.com/' },
      { name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
      { name: 'PostGIS', link: 'https://postgis.net/' },
      { name: 'MSSQL', link: 'https://www.microsoft.com/en-us/sql-server/sql-server-2019' },
    ]
  },
  {
    name: 'Data Processing',
    color: 'bg-yellow-500',
    skills: [
      { name: 'OCR', link: 'https://github.com/tesseract-ocr/tesseract' },
      { name: 'OpenCV', link: 'https://opencv.org/' },
      { name: 'FME Workbench + Flow', link: 'https://www.safe.com/' }
    ]
  },
  {
    name: 'Mapping',
    color: 'bg-indigo-500',
    skills: [
      { name: 'Leaflet', link: 'https://leafletjs.com/' },
      { name: 'Mapbox', link: 'https://www.mapbox.com/' },
      { name: 'ArcGIS', link: 'https://www.esri.com/en-us/arcgis/products/arcgis-online/overview' },
      { name: 'QGIS', link: 'https://qgis.org/en/site/' },
    ]
  },
  {
    name: 'Soft Skills',
    color: 'bg-pink-500',
    skills: [
      { name: 'Teamwork' },
      { name: 'Solo Development' },
      { name: 'Invoicing' },
      { name: 'Code Review' },
      { name: 'Time Management' },
      { name: 'Managing Undergrads' },
    ]
  },
  {
    name: 'Hardware',
    color: 'bg-teal-500',
    skills: [
      { name: 'Raspberry Pi', link: 'https://www.raspberrypi.org/' },
      { name: 'Arduino ESP32', link: 'https://docs.arduino.cc/hardware/nano-esp32/'},
      { name: '12v Electronics'},
      { name: 'Commercial Server Hardware'},
      { name: 'Consumer Tech'},
    ]
  },
];

const SkillTags = () => {
    return (
      <div className="mt-12 p-6 bg-gray-700 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Tag className="mr-2" />
          Skills
        </h2>
        
        {/* Color Legend */}
        <div className="mb-4 flex flex-wrap gap-2">
          {skillCategories.map((category, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${category.color} mr-2`}></div>
              <span className="text-sm">{category.name}</span>
            </div>
          ))}
        </div>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skillCategories.flatMap((category, categoryIndex) =>
            category.skills.map((skill, skillIndex) => (
              <a
                key={`${categoryIndex}-${skillIndex}`}
                href={skill.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1 ${category.color} text-white rounded-full text-sm hover:opacity-80 transition-opacity ${!skill.link && 'pointer-events-none'}`}
              >
                {skill.name}
              </a>
            ))
          )}
        </div>
      </div>
    );
  };
  

export default SkillTags;