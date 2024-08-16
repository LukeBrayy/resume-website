import React, { useEffect, useRef } from 'react';

const TableauEmbed = () => {
  const vizRef = useRef(null);

  useEffect(() => {
    if (vizRef.current) {
      const vizElement = vizRef.current.getElementsByTagName('object')[0];
      
      // Make the visualization wider and shorter
      vizElement.style.width = '100%';
      vizElement.style.height = '400px'; // Adjust this value to make it shorter
      
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
      vizElement.parentNode.insertBefore(scriptElement, vizElement);
    }
  }, []);

  return (
    <div 
      className='tableauPlaceholder' 
      ref={vizRef} 
      style={{ 
        position: 'relative',
        width: '100%', // Make it full width of its container
        maxWidth: '1200px', // Set a maximum width if needed
        margin: '0 auto', // Center the component if it's narrower than its container
        borderRadius: '15px', // Round the corners
        overflow: 'hidden' // Ensure the rounded corners are visible
      }}
    >
      <noscript>
        <a href='#'>
          <img
            alt='Dashboard 1'
            src='https://public.tableau.com/static/images/of/offroad_vehicle_market/Dashboard1/1_rss.png'
            style={{ border: 'none', width: '100%', height: 'auto' }}
          />
        </a>
      </noscript>
      <object className='tableauViz' style={{ display: 'none', width: '95%', height: '100%' }}>
        <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
        <param name='embed_code_version' value='3' />
        <param name='site_root' value='' />
        <param name='name' value='offroad_vehicle_market/Dashboard1' />
        <param name='tabs' value='no' />
        <param name='toolbar' value='yes' />
        <param name='static_image' value='https://public.tableau.com/static/images/of/offroad_vehicle_market/Dashboard1/1.png' />
        <param name='animate_transition' value='yes' />
        <param name='display_static_image' value='yes' />
        <param name='display_spinner' value='yes' />
        <param name='display_overlay' value='yes' />
        <param name='display_count' value='yes' />
        <param name='language' value='en-US' />
      </object>
    </div>
  );
};

export default TableauEmbed;