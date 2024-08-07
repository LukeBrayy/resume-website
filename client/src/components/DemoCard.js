import React from 'react';

const DemoCard = ({ title, children, backgroundColor = 'bg-blue-800' }) => {
  return (
    <div className={`${backgroundColor} bg-opacity-50 p-6 rounded-lg mb-6 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl mb-6 font-['Montserrat',sans-serif]`}>
      <div className="bg-blue-700 px-4 py-2 rounded-lg mb-5 flex justify-center items-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default DemoCard;