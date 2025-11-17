import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../utils/responsive';

type Props = {
  onStartOnboarding: () => void;
};

const TopBar: React.FC<Props> = ({ onStartOnboarding }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState('🌤️');
  

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 根据时间随机设置天气图标
  useEffect(() => {
    const weatherIcons = ['☀️', '⛅', '🌤️', '🌥️', '🌦️'];
    const randomWeather = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
    setWeather(randomWeather);
  }, []);

  // 格式化日期
  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNumber = date.getDate();
    
    return `${dayName}, ${monthName} ${dayNumber}`;
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="w-full h-10 md:h-12 flex items-center justify-between px-3 md:px-6 bg-white/20 backdrop-blur-md border-b border-white/20 text-white text-xs md:text-sm select-none">
      {/* Left: Profile */}
      <div className="flex items-center gap-1 md:gap-2">
        <img 
          src="/kyle-avatar.png"
          alt="Kyle Avatar"
          className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white/40"
        />
        <span className="font-semibold">Kyle</span>
      </div>
      
      {/* Center: Empty or App Name */}
      <div></div>
      
      {/* Right: Weather, Date & Time, Onboarding Button */}
      <div className="flex items-center gap-2 md:gap-4 opacity-80">
        <span>{weather}</span>
        <button
          onClick={onStartOnboarding}
          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/30 hover:border-white/50 text-xs font-medium"
          title="Start Tutorial"
        >
          📖 Guide
        </button>
        <span className="hidden sm:inline">{formatDate(currentTime)}</span>
        <span>{formatTime(currentTime)}</span>
      </div>
    </div>
  );
};

export default TopBar; 