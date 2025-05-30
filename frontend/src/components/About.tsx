import React from 'react';

type AboutProps = {
  onClose: () => void;
};

const About: React.FC<AboutProps> = ({ onClose }) => {
  const handleResumeClick = () => {
    // 在新标签页中打开Resume PDF
    window.open('/resume.pdf', '_blank');
  };

  const handleDownloadResume = () => {
    // 下载Resume PDF
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Kyle_Meng_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center relative px-8"
      onClick={onClose}
    >
      <div
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-4xl w-full relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* 关闭按钮 */}
        <button
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200"
          onClick={onClose}
        >
          <span className="text-xl">✕</span>
        </button>

        {/* 主要内容 */}
        <div className="relative z-10">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">About Me</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* 自我介绍 */}
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              Hello! I'm <span className="font-semibold text-blue-600">Kyle Meng</span>, a passionate 
              <span className="font-semibold"> Full-Stack Developer</span> with expertise in modern web technologies. 
              I specialize in creating elegant, user-friendly applications using React, TypeScript, and Java Spring Boot. 
              I'm passionate about clean code, innovative solutions, and continuous learning in the ever-evolving tech landscape.
            </p>
          </div>

          {/* 技能标签 */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {['React', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'].map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume 部分 */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Want to know more?</h3>
            <p className="text-gray-600 mb-6">Check out my detailed resume below</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleResumeClick}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span className="mr-2">👁️</span>
                View Resume
              </button>
              
              <button
                onClick={handleDownloadResume}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span className="mr-2">⬇️</span>
                Download Resume
              </button>
            </div>
          </div>

          {/* 联系信息提示 */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Feel free to reach out for collaboration opportunities or just to say hello! 👋
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 