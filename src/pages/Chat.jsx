import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';

const Chat = () => {
  const [contacts, setContacts] = useState([
  {
    id: 1,
    name: 'Dr. Sarah Ahmed',
    role: 'Calculus Tutor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    online: true,
    lastMessage: 'Let us resume the calculus session tomorrow.',
    time: '10:42 AM',
    unread: 2,
  },
  {
    id: 2,
    name: 'Prof. Tariq Mahmood',
    role: 'Physics Specialist',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    online: false,
    lastMessage: 'I have uploaded the assignment feedback.',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 3,
    name: 'Zainab Raza',
    role: 'Linear Algebra Peer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    online: true,
    lastMessage: 'Can you share the notes for vector spaces?',
    time: '2 days ago',
    unread: 0,
  },
  {
    id: 4,
    name: 'Hamza Ali',
    role: 'Computer Science Tutor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    online: true,
    lastMessage: 'I can help you with the programming assignment.',
    time: '9:15 AM',
    unread: 1,
  },
  {
    id: 5,
    name: 'Ayesha Khan',
    role: 'Chemistry Tutor',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
    online: false,
    lastMessage: 'The organic chemistry notes are ready.',
    time: 'Yesterday',
    unread: 3,
  },
  {
    id: 6,
    name: 'Omar Farooq',
    role: 'Statistics Tutor',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    online: true,
    lastMessage: 'Let me know if you need help with probability.',
    time: 'Monday',
    unread: 0,
  },
  {
    id: 7,
    name: 'Maham Siddiqui',
    role: 'English Literature Tutor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    online: false,
    lastMessage: 'I reviewed your essay and added some comments.',
    time: 'Sunday',
    unread: 1,
  },
  {
    id: 8,
    name: 'Usman Ahmed',
    role: 'Data Science Tutor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    online: true,
    lastMessage: 'The Python project is looking good so far.',
    time: 'Saturday',
    unread: 0,
  },
  {
    id: 9,
    name: 'Hira Malik',
    role: 'Biology Specialist',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150',
    online: true,
    lastMessage: 'I have shared the chapter 5 study guide.',
    time: 'Friday',
    unread: 2,
  },
  {
    id: 10,
    name: 'Bilal Hassan',
    role: 'Programming Peer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    online: false,
    lastMessage: 'Did you solve the recursion problem?',
    time: 'Thursday',
    unread: 0,
  },
]);

  const [activeContactId, setActiveContactId] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchContact, setSearchContact] = useState('');

    const [messagesMap, setMessagesMap] = useState({
  1: [
    {
      id: 101,
      sender: 'them',
      text: 'Hello Rafay! How is your progress on differential equations?',
      time: '10:30 AM',
    },
    {
      id: 102,
      sender: 'me',
      text: 'Hi Dr. Sarah! I completed the exercise set, but had a doubt on second-order ODEs.',
      time: '10:35 AM',
    },
    {
      id: 103,
      sender: 'them',
      text: 'Let us resume the calculus session tomorrow.',
      time: '10:42 AM',
    },
  ],

  2: [
    {
      id: 201,
      sender: 'them',
      text: 'I have uploaded the assignment feedback.',
      time: 'Yesterday',
    },
    {
      id: 202,
      sender: 'me',
      text: 'Thank you, Professor. I will review the feedback today.',
      time: 'Yesterday',
    },
    {
      id: 203,
      sender: 'them',
      text: 'Focus especially on the numerical problems in section 3.',
      time: 'Yesterday',
    },
  ],

  3: [
    {
      id: 301,
      sender: 'them',
      text: 'Can you share the notes for vector spaces?',
      time: '2 days ago',
    },
    {
      id: 302,
      sender: 'me',
      text: 'Sure! I will send them to you shortly.',
      time: '2 days ago',
    },
    {
      id: 303,
      sender: 'them',
      text: 'Thanks! I really appreciate it.',
      time: '2 days ago',
    },
  ],

  4: [
    {
      id: 401,
      sender: 'them',
      text: 'I can help you with the programming assignment.',
      time: '9:05 AM',
    },
    {
      id: 402,
      sender: 'me',
      text: 'That would be great. I am having trouble with the implementation.',
      time: '9:10 AM',
    },
    {
      id: 403,
      sender: 'them',
      text: 'No problem. Send me the code and we will go through it together.',
      time: '9:15 AM',
    },
  ],

  5: [
    {
      id: 501,
      sender: 'them',
      text: 'The organic chemistry notes are ready.',
      time: 'Yesterday',
    },
    {
      id: 502,
      sender: 'me',
      text: 'Perfect. I was looking for the reaction mechanisms section.',
      time: 'Yesterday',
    },
    {
      id: 503,
      sender: 'them',
      text: 'I included that section with some additional examples.',
      time: 'Yesterday',
    },
  ],

  6: [
    {
      id: 601,
      sender: 'them',
      text: 'Let me know if you need help with probability.',
      time: 'Monday',
    },
    {
      id: 602,
      sender: 'me',
      text: 'I am struggling a little with conditional probability.',
      time: 'Monday',
    },
    {
      id: 603,
      sender: 'them',
      text: 'Sure. We can cover it in our next session.',
      time: 'Monday',
    },
  ],

  7: [
    {
      id: 701,
      sender: 'them',
      text: 'I reviewed your essay and added some comments.',
      time: 'Sunday',
    },
    {
      id: 702,
      sender: 'me',
      text: 'Thank you! I will make the changes based on your feedback.',
      time: 'Sunday',
    },
    {
      id: 703,
      sender: 'them',
      text: 'Great. Your overall structure is already quite strong.',
      time: 'Sunday',
    },
  ],

  8: [
    {
      id: 801,
      sender: 'them',
      text: 'The Python project is looking good so far.',
      time: 'Saturday',
    },
    {
      id: 802,
      sender: 'me',
      text: 'Thanks! I have completed the data preprocessing part.',
      time: 'Saturday',
    },
    {
      id: 803,
      sender: 'them',
      text: 'Excellent. Next, focus on improving the model accuracy.',
      time: 'Saturday',
    },
  ],

  9: [
    {
      id: 901,
      sender: 'them',
      text: 'I have shared the chapter 5 study guide.',
      time: 'Friday',
    },
    {
      id: 902,
      sender: 'me',
      text: 'Got it. Is there anything specific I should focus on?',
      time: 'Friday',
    },
    {
      id: 903,
      sender: 'them',
      text: 'Focus on the diagrams and key biological processes.',
      time: 'Friday',
    },
  ],

  10: [
    {
      id: 1001,
      sender: 'them',
      text: 'Did you solve the recursion problem?',
      time: 'Thursday',
    },
    {
      id: 1002,
      sender: 'me',
      text: 'Not completely. I am getting confused with the base case.',
      time: 'Thursday',
    },
    {
      id: 1003,
      sender: 'them',
      text: 'I had the same issue. Let me show you how I approached it.',
      time: 'Thursday',
    },
  ],
});

  const [messageText, setMessageText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);

  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];
  const activeMessages = activeContactId ? (messagesMap[activeContactId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesMap, activeContactId]);

  const handleSelectContact = (id) => {
    setActiveContactId(id);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedImage) return;
    if (!activeContactId) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      image: attachedImage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));

    setContacts(prev => prev.map(c => 
      c.id === activeContactId 
        ? { ...c, lastMessage: messageText || 'Sent an image', time: 'Just now' }
        : c
    ));

    setMessageText('');
    setAttachedImage(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAttachedImage(imageUrl);
      setIsAttachmentPickerOpen(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setIsCameraActive(false);
      alert('Camera access denied or unequipped.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 300;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setAttachedImage(imageUrl);
      setIsAttachmentPickerOpen(false);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.role.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50/60 font-sans text-slate-800 overflow-hidden selection:bg-slate-900 selection:text-white">
      <Sidebar activePage="chat" />

      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileSelect} 
      />

      <main className="flex-1 flex overflow-hidden w-full p-0 md:p-4 gap-4">
        
        {/* CONTACTS SIDEBAR */}
        <div className={`w-full md:w-80 bg-white md:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-full shrink-0 transition-all duration-300 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-5 pl-14 md:pl-5 border-b border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Messages</h1>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {contacts.length}
              </span>
            </div>
            
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full bg-slate-100/70 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 border border-transparent focus:border-slate-300 outline-none transition-all duration-200"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          {/* Contact Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const isActive = activeContactId === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`p-3 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                      : 'hover:bg-slate-100/70 text-slate-800'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={contact.avatar} 
                      alt={contact.name} 
                      className={`w-11 h-11 rounded-full object-cover transition-transform duration-200 ${isActive ? 'ring-2 ring-white/20' : ''}`} 
                    />
                    {contact.online && (
                      <span className="w-3 h-3 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {contact.name}
                      </h4>
                      <span className={`text-[10px] shrink-0 ml-2 ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                        {contact.time}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CHAT SCREEN */}
<div className={`flex-1 flex flex-col h-full bg-white md:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden w-full ${
  !showMobileChat ? 'hidden md:flex' : 'flex'
}`}>
  {activeContactId ? (
    <>
      {/* Header with left padding on mobile for sidebar trigger */}
      <header className="px-5 pl-16 md:pl-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleBackToList}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            aria-label="Back to contacts list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="relative shrink-0">
            <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
            {activeContact.online && (
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></span>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">{activeContact.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activeContact.online ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <p className="text-[11px] text-slate-400 font-medium">{activeContact.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-100 transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </button>
        </div>
      </header>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-50/40">
                {activeMessages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed transition-all ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-xs shadow-sm'
                            : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/60 shadow-xs'
                        }`}
                      >
                        {msg.image && (
                          <img src={msg.image} alt="Attachment" className="w-full max-h-56 object-cover rounded-xl mb-2.5 border border-slate-100 shadow-xs" />
                        )}
                        {msg.text && <p className="break-words font-medium">{msg.text}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">{msg.time}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer / Input Bar */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                {attachedImage && (
                  <div className="mb-3 relative inline-block">
                    <img src={attachedImage} alt="Preview" className="w-16 h-16 object-cover rounded-2xl border border-slate-200 shadow-xs" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center cursor-pointer shadow-md hover:bg-slate-800 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAttachmentPickerOpen(true)}
                    className="p-3 text-slate-400 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-200/60 rounded-2xl transition-all duration-200 cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 min-w-0 bg-slate-100/70 focus:bg-white rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 placeholder-slate-400 border border-transparent focus:border-slate-300 outline-none transition-all duration-200"
                  />

                  <button
                    type="submit"
                    className="px-5 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer shadow-md shadow-slate-900/10 shrink-0 flex items-center gap-2"
                  >
                    <span>Send</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-medium">
              Select a conversation to start messaging
            </div>
          )}

        </div>
      </main>

      {/* ATTACHMENT MODAL */}
      {isAttachmentPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => {
                setIsAttachmentPickerOpen(false);
                stopCamera();
              }}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 cursor-pointer text-xs flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-800 mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1">Send Attachment</h3>
            <p className="text-xs text-slate-400 mb-6">Choose how you want to attach an image</p>

            {!isCameraActive ? (
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center text-slate-700 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Choose from Files</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Upload high-res photos or assets</p>
                  </div>
                </button>

                <button
                  onClick={startCamera}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-2xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center text-slate-700 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l0.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l0.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Take Photo</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Snap directly using your camera</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-56 bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={captureCameraPhoto}
                    className="flex-1 py-3 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-slate-900/10"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Capture
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;