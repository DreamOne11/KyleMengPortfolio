import React from 'react';

type Props = {
  children: React.ReactNode;
};

const DesktopContainer: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-blue-400 to-pink-300">
      <div className="relative w-[90vw] max-w-6xl h-[90vh] rounded-3xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DesktopContainer; 