import React, { useState, useRef } from 'react';
import FileManager from '../windows/FileManager';
import MacOSFolderIcon from './MacOSFolderIcon';

type FolderIconProps = {
  name: string;
  x?: number;
  y?: number;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
};

const FolderIcon: React.FC<FolderIconProps> = ({ name, x = 100, y = 100, color = 'blue' }) => {
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x, y });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    // 获取图标的准确位置
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setIconPosition({ x: centerX, y: centerY });
      setIsFileManagerOpen(true);
    }
  };

  const handleCloseFileManager = () => {
    setIsFileManagerOpen(false);
  };

  return (
    <>
      {/* 文件夹图标 */}
      <div
        ref={iconRef}
        className="absolute flex flex-col items-center cursor-pointer hover:bg-blue-100/20 rounded-lg p-2 transition-colors"
        style={{ left: x, top: y }}
        onDoubleClick={handleDoubleClick}
      >
        <div className="w-16 h-16 flex items-center justify-center mb-1">
          <MacOSFolderIcon color={color} />
        </div>
        <span className="text-sm text-gray-800 text-center max-w-20 truncate">
          {name}
        </span>
      </div>

      {/* 文件管理器弹窗 */}
      {isFileManagerOpen && (
        <FileManager
          folderName={name}
          onClose={handleCloseFileManager}
          sourcePosition={iconPosition}
          useRelativePositioning={true}
        />
      )}
    </>
  );
};

export default FolderIcon; 