import React from 'react';
import DemoCard from './DemoCard';

const styles = {
  container: "min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 font-['Montserrat',sans-serif]",  content: "max-w-6xl mx-auto",
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
  
  
  const Demos = () => {
    return (
      <div className={styles.demosContainer}>
        <h2 className={styles.demosHeader}>Project Demos</h2>
        <DemoCard title="State Wide Drillhole Assay Search and Display" backgroundColor="bg-blue-900">
          <p className="text-sm text-blue-200 mb-4">
            Querying and transforming public data for the Department of Mines. 
            Hosted for the client providing a stable public service with regular usage.
          </p>
          <a 
            href="https://wamexgeochem.net.au" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full hover:opacity-80 transition-opacity"
          >
            <img 
              src="/wamexscreen.png" 
              alt="State Wide Drillhole Assay Search and Display Screenshot" 
              className="w-full rounded-lg shadow-lg" 
            />
          </a>
        </DemoCard>
        <DemoCard title="Dylexia-Assistant ChatBot" backgroundColor="bg-gray-900">
          <p className="text-sm text-blue-200">
            A demonstration of natural language processing capabilities.
          </p>
          {/* Add your chat bot demo here */}
        </DemoCard>
        <DemoCard title="Custom Massive Text Search Engine" backgroundColor="bg-gray-900">
          <p className="text-sm text-blue-200 mb-4">
            Hosting a public service search engine, querying 200,000+ mineral exploration reports in milliseconds.
          </p>
          <a 
            href="https://wamexsearch.net.au" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full hover:opacity-80 transition-opacity"
          >
            <img 
              src="/searchscreen.png" 
              alt="WamexSearch.net.au Screenshot" 
              className="w-full rounded-lg shadow-lg" 
            />
          </a>
        </DemoCard>
        <DemoCard title="3D Model Viewer">
          <p className="text-sm text-blue-200">
          An interactive chart showcasing data analysis skills.
          </p>
          {/* Add your 3D model viewer here */}
        </DemoCard>

        <DemoCard title="Interactive Node + ReactJS Resume">
          <p className="text-sm text-blue-200">
            This webpage! View the source code on GitHub.
          </p>
          {/* Add your 3D model viewer here */}
        </DemoCard>
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
          <Demos />
        </div>
      </div>
    </div>
  );
};

export default ModernResume;