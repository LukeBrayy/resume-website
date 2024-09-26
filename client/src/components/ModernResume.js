import React, { useEffect, useRef } from 'react';
import DemoCard from './DemoCard';
import TableauEmbed from './TableauEmbed';
import SkillTags from './SkillTags';

const styles = {
  container: "min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 font-['Montserrat',sans-serif]",
  content: "max-w-6xl mx-auto",
  header: "text-4xl font-bold mb-8",
  section: "flex flex-col md:flex-row",
  experienceContainer: "w-full md:w-1/2 mb-8 md:mb-0",
  experienceHeader: "text-2xl font-semibold mb-4",
  timeline: "relative",
  timelineSegment: "absolute w-1",
  experiencePoint: "absolute w-full",
  experienceContent: "relative flex items-start mb-12",
  experienceDot: "w-5 h-5 rounded-full z-10 absolute",
  experienceText: "ml-8",
  experienceTitle: "text-xl font-semibold",
  experienceCompany: "text-blue-200 flex items-center mt-2",
  experienceDate: "text-sm text-blue-100 mt-1",
  companyLogo: "w-16 h-16 object-contain",
  eventPoint: "absolute w-full",
  eventContent: "relative flex items-start mb-8",
  eventDot: "w-4 h-4 rounded-full z-10 absolute bg-white",
  eventText: "ml-8",
  eventTitle: "text-sm font-semibold",
  eventDate: "text-xs text-blue-100",
  projectsContainer: "w-full md:w-1/2",
  projectsHeader: "text-2xl font-semibold mb-4",
  projectCard: "bg-blue-800 bg-opacity-50 p-4 rounded-lg",
  projectTitle: "text-lg mb-2",
  projectDescription: "text-sm text-blue-200",
  logoContainer: "mr-3 p-2 rounded-lg flex items-center justify-center",
  logoBackground: "bg-white bg-opacity-60",
  demosContainer: "w-full md:w-1/2",
  demosHeader: "text-2xl font-semibold mb-4",
  fullWidthDemosContainer: "w-full mt-8",
  fullWidthDemosHeader: "text-2xl font-semibold mb-4",
};

const colors = [
  '#CE372F',   // red-500
  '#F37324',  // orexplore orange
  '#ff78be',  // blue-500
  'rgb(236, 72, 153)',  // pink-500
];

const ModernResume = () => {
  const experiences = [
    { id: 1, title: 'GIS Software Developer', company: 'Mineral Resources', startDate: '2023-10', endDate: 'Present', logo: 'minres_logo.png', website: 'https://www.mineralresources.com.au/' },
    { id: 2, title: 'Software Engineer', company: 'Orexplore Technologies', startDate: '2020-03', endDate: '2023-10', logo: 'orexplore_logo.png', website: 'https://orexplore.com/' },
    { id: 3, title: 'Software Developer', company: 'Sandfire Resources', startDate: '2018-10', endDate: '2020-03', logo: 'sandfire_logo.png', website: 'https://www.sandfire.com.au/' },
  ];

  const events = [
    { id: 10, title: 'Graduated University of Western Australia - BSc. Computer Science, Data Science', date: '2022-12' },
    { id: 11, title: 'UWA Squash Club President (1 year)', date: '2022-08' },
    { id: 12, title: 'DMIRS GSWA Contract Dev (until present)', date: '2019-11' },
  ];

  const calculatePosition = (date) => {
    const start = new Date('2018-10-01');
    const end = new Date();
    const current = new Date(date);
    const totalDuration = end.getTime() - start.getTime();
    const currentDuration = current.getTime() - start.getTime();
    return (currentDuration / totalDuration) * 100;
  };

  const sortedExperiences = [...experiences].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const allItems = [...sortedExperiences, ...events].sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date));
  
  const demos = [
    {
      id: 1,
      title: "State Wide Drillhole Assay Search and Display",
      description: "Querying and transforming public data for the Department of Mines. Hosted for the client providing a stable public service with regular usage.",
      link: "https://wamexgeochem.net.au",
      image: "/wamexscreen.png",
      fullWidth: false,
    },
    {
      id: 2,
      title: "Dyslexia-Assistant ChatBot",
      description: "A demonstration of using AI tools to increase accessibility. Demo incoming when I can figure out how to stop it being abused.",
      fullWidth: false,
    },
    {
      id: 3,
      title: "Custom Massive Text Search Engine",
      description: "Hosting a public service search engine, querying 200,000+ mineral exploration reports in milliseconds.",
      link: "https://wamexsearch.net.au",
      image: "/searchscreen.png",
      fullWidth: false,
    },
    {
      id: 4,
      title: "Used Car Market 2022- Various Models",
      description: "Used car prices were scraped every 5 minutes for several months. The data was cleaned at categorised then visualised in Tableau.",
      link: "https://public.tableau.com/app/profile/luke6334/viz/offroad_vehicle_market/Dashboard1",
      linkText: "View full visualisation",
      component: TableauEmbed,
      fullWidth: true,
    },
    {
      id: 5,
      title: "Interactive Node + ReactJS Resume",
      description: "This webpage! Automatic deployments on push to main. Hosted with DigitalOcean.",
      fullWidth: false,
      link: "https://github.com/LukeBrayy/resume-website",
      linkText: "View on GitHub",
    },
    {
      id: 6,
      title: "Raspberry Pi Smart 12v Car",
      description: "Using a Raspberry Pi4 a dual 12v battery system and some electronics, I created a remote controllable lighting system for my 4x4. The system is controlled via a web interface or physical toggle buttons. [video incoming!]",
      fullWidth: true,
    },
    {
      id: 7,
      title: "Arduino ESP32 GPS Speedometer",
      description: "My girlfriend's 1985 Hilux has a dodgy speedo. I used an ESP32 and a GPS module to create a digital speedometer. It has not stopped her getting speeding tickets. [video incoming!]",
      fullWidth: true,
    },
    {
      id: 8,
      title: "Secret Santa Webpage",
      description: "Random secret santa solver with set rules for blacklisting pairs, avoiding couple matches and pre-defining some matches.",
      fullWidth: true,
      link: "https://lukebray.au/SecretSanta",
      linkText: "Secret Santa Sorter",
      image: "/secretsanta.png",
    }
    // {
    //   id: 8,
    //   title: "Server Hardware Builds",
    //   description: "I have built several servers for commericial use and edge-compute racks. At Orexplore I deployed (and un-deployed our entire self-contained IT at 5 remote sites across the Australian desert, with custom server builds.",
    //   fullWidth: true,
    //   // component: Servers,
    // }
  ];

  const Demos = ({ fullWidth = false }) => {
    const containerClass = fullWidth ? styles.fullWidthDemosContainer : styles.demosContainer;
    const headerClass = fullWidth ? styles.fullWidthDemosHeader : styles.demosHeader;
    
    const filteredDemos = demos.filter(demo => demo.fullWidth === fullWidth);
    
    return (
      <div className={containerClass}>
        <h2 className={headerClass}>{fullWidth ? "Full-Width Project Demos" : "Project Demos"}</h2>
        <div className={fullWidth ? "" : styles.demoGrid}>
          {filteredDemos.map(demo => (
            <DemoCard key={demo.id} title={demo.title} backgroundColor="bg-gray-900">
              <p className="text-sm text-blue-200 mb-4">
                {demo.description}
                {demo.link && demo.linkText && (
                  <>
                    {' '}
                    <a
                      href={demo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {demo.linkText}
                    </a>
                  </>
                )}
              </p>
              {demo.link && demo.image && (
                <a 
                  href={demo.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={demo.image} 
                    alt={`${demo.title} Screenshot`} 
                    className="w-full rounded-lg shadow-lg" 
                  />
                </a>
              )}
              {demo.component && <demo.component />}
            </DemoCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.header}>Luke Bray (.au)</h1>
        <div className={styles.section}>
          <div className={styles.experienceContainer}>
            <h2 className={styles.experienceHeader}>Experience & Achievements</h2>
            <div className={styles.timeline} style={{ height: '1000px' }}>
              {sortedExperiences.map((exp, index) => {
                const startPosition = calculatePosition(exp.startDate);
                const endPosition = exp.endDate === 'Present' ? 100 : calculatePosition(exp.endDate);
                const color = colors[index % colors.length];
                return (
                  <div
                    key={exp.id}
                    className={styles.timelineSegment}
                    style={{
                      top: `${startPosition}%`,
                      height: `${endPosition - startPosition}%`,
                      backgroundColor: color,
                      left: '16px',
                    }}
                  ></div>
                );
              })}
              {allItems.map((item, index) => {
                const isExperience = 'company' in item;
                const position = calculatePosition(item.startDate || item.date);
                const color = isExperience ? colors[sortedExperiences.findIndex(exp => exp.id === item.id) % colors.length] : 'white';

                return (
                  <div key={item.id} style={{ top: `${position}%` }} className={isExperience ? styles.experiencePoint : styles.eventPoint}>
                    <div className={isExperience ? styles.experienceContent : styles.eventContent}>
                      <div 
                        className={isExperience ? styles.experienceDot : styles.eventDot} 
                        style={{ 
                          backgroundColor: color, 
                          left: isExperience ? '8px' : '10px'
                        }}
                      ></div>
                      <div className={styles.experienceText}>
                        {isExperience ? (
                          <>
                            <h3 className={styles.experienceTitle} style={{ color }}>{item.title}</h3>
                            <p className={styles.experienceCompany}>
                              <a href={item.website} target="_blank" rel="noopener noreferrer" className={`${styles.logoContainer} ${styles.logoBackground}`}>
                                <img src={`/${item.logo}`} alt={`${item.company} logo`} className={styles.companyLogo} />
                              </a>
                              {item.company}
                            </p>
                            <p className={styles.experienceDate}>{`${item.startDate} - ${item.endDate}`}</p>
                          </>
                        ) : (
                          <>
                            <h4 className={styles.eventTitle}>{item.title}</h4>
                            <p className={styles.eventDate}>{item.date}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Demos fullWidth={false}/>
        </div>
        <SkillTags />
        <Demos fullWidth={true} />
      </div>
    </div>
  );
};

export default ModernResume;