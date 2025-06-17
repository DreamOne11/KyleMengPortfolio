import React, { useState, useEffect } from 'react';
import Kyle3DModel from '../models/Kyle3DModel';

const KyleChat: React.FC = () => {
  // 3D聊天机器人状态管理
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [currentBubbleText, setCurrentBubbleText] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{
    type: 'bot' | 'user';
    content: string;
  }>>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };
  
  // 监听消息变化，自动滚动
  useEffect(() => {
    if (isChatExpanded && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages, isChatExpanded]);
  
  // 自言自语的文字数组
  const bubbleTexts = [
    "Hi, ask me a question",
    "I'm here to help! 👋",
    "Want to know about Kyle?",
    "Feel free to chat with me!",
    "I love answering questions 💭"
  ];
  
  // 预设问题选项
  const presetQuestions = [
    "Just saying hello!",
    "We'd like to hire you",
    "Tell me about your projects",
    "What are your skills?"
  ];
  
  // 预设回答 - 每个问题有多条分段回复
  const botResponses: { [key: string]: string[] } = {
    "Just saying hello!": [
      "Hello!",
      "Thanks for saying hi 😊",
      "I hope you've enjoyed browsing my work"
    ],
    "We'd like to hire you": [
      "That's wonderful news!",
      "Kyle is always open to exciting new opportunities",
      "Please check out his Resume and feel free to reach out directly through the Contact section"
    ],
    "Tell me about your projects": [
      "Kyle has worked on some amazing projects!",
      "His expertise spans web development, distributed systems, and more",
      "You can explore his detailed work in the 'My Work' section"
    ],
    "What are your skills?": [
      "Kyle is a versatile full-stack developer",
      "He specializes in React, Node.js, Java, and many other modern technologies",
      "Plus he's also passionate about photography and design!"
    ]
  };
  
  // 自动轮换气泡文字
  useEffect(() => {
    if (!isChatExpanded) {
      const interval = setInterval(() => {
        setCurrentBubbleText((prev) => (prev + 1) % bubbleTexts.length);
      }, 3000); // 每3秒切换一次
      return () => clearInterval(interval);
    }
  }, [isChatExpanded, bubbleTexts.length]);
  
  // 处理3D模型双击
  const handle3DModelDoubleClick = () => {
    setIsChatExpanded(!isChatExpanded);
    if (!isChatExpanded) {
      setChatMessages([
        { type: 'bot', content: "Hi!" },
        { type: 'bot', content: "I'm Kyle Bot. I'm here to help you with any questions you might have about Kyle's work." },
        { type: 'bot', content: "How can I help you today?" }
      ]);
    }
  };
  
  // 处理预设问题点击
  const handlePresetQuestion = (question: string) => {
    if (isGeneratingResponse) return; // 防止在生成回复时重复点击
    
    setIsGeneratingResponse(true);
    
    // 先添加用户问题
    setChatMessages(prev => [
      ...prev,
      { type: 'user', content: question }
    ]);
    
    // 获取该问题的回复数组
    const responses = botResponses[question] || ["Thanks for your question! I'll get back to you on that."];
    
    // 逐步添加机器人回复
    responses.forEach((response, index) => {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { type: 'bot', content: response }
        ]);
        
        // 如果是最后一条回复，添加"Can I help you with anything else?"
        if (index === responses.length - 1) {
          setTimeout(() => {
            setChatMessages(prev => [
              ...prev,
              { type: 'bot', content: "Can I help you with anything else?" }
            ]);
            
            // 完成回复生成
            setIsGeneratingResponse(false);
          }, 750); // 0.75秒后添加询问
        }
      }, (index + 1) * 750); // 每条回复间隔0.75秒
    });
  };

  // 获取可用的预设问题（排除已经问过的）
  const getAvailableQuestions = () => {
    if (isGeneratingResponse) return []; // 生成回复期间隐藏所有问题
    
    const askedQuestions = chatMessages
      .filter(msg => msg.type === 'user')
      .map(msg => msg.content);
    return presetQuestions.filter(q => !askedQuestions.includes(q));
  };

  return (
    <>
      {/* 3D Model - positioned in top right corner */}
      <div 
        className="absolute z-20 cursor-pointer"
        style={{
          right: 'min(1rem, 2vw)',
          top: 'calc(-5vh)',
          width: 'min(8rem, 10vw)',
          height: 'min(8rem, 10vw)',
          minWidth: '192px',
          minHeight: '192px'
        }}
        onDoubleClick={handle3DModelDoubleClick}
        title="Double-click to chat with me!"
      >
        <Kyle3DModel />
      </div>
      
      {/* Speech Bubble / Chat Interface */}
      <div 
        className="absolute z-30"
        style={{
          right: 'min(10rem, 15vw)',
          top: 'min(2rem, 3vh)',
          maxWidth: '350px',
          minWidth: '280px'
        }}
      >
        <div className={`relative bg-white/10 backdrop-blur-md shadow-xl transition-all duration-500 ${
          isChatExpanded 
            ? 'rounded-3xl max-h-[600px] overflow-hidden' 
            : 'rounded-2xl max-h-16'
        }`}>
          {!isChatExpanded ? (
            // Simple bubble mode
            <div className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-2xl relative">
              <p className="text-gray-800 text-sm font-medium transition-all duration-300">
                {bubbleTexts[currentBubbleText]}
              </p>
              {/* Simple mode arrow */}
              <div 
                className="absolute top-3 -right-2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))'
                }}
              ></div>
            </div>
          ) : (
            // Expanded chat mode
            <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden relative border border-white/20">
              {/* Chat Header */}
              <div className="bg-teal-600/90 backdrop-blur-sm text-white p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white/20">
                      <img 
                        src="/kyle-avatar.png" 
                        alt="Kyle Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Kyle Bot</p>
                      <p className="text-xs text-teal-100">Ask me a question</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsChatExpanded(false)}
                    className="text-white/80 hover:text-white text-xl w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Chat Content */}
              <div 
                ref={chatContainerRef}
                className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-4 overflow-y-auto"
                style={{ 
                  maxHeight: '450px',
                  minHeight: '450px'
                }}
              >
                {/* All Messages in one continuous flow */}
                <div className="space-y-3">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm ${
                        message.type === 'user' 
                          ? 'bg-blue-500/90 text-white rounded-br-md border border-blue-400/20' 
                          : 'bg-white/60 text-gray-800 rounded-bl-md border border-white/40'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {/* Quick Questions - only show if there are available questions */}
                  {getAvailableQuestions().length > 0 && (
                    <div className="mt-4 space-y-2">
                      {getAvailableQuestions().map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetQuestion(question)}
                          className="w-full text-center font-bold p-3 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-full text-sm text-gray-800 transition-all border border-gray-600/60 hover:border-gray-700/80 shadow-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expanded mode arrow */}
              <div 
                className="absolute top-4 -right-3"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid rgba(255, 255, 255, 0.1)',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))'
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KyleChat; 