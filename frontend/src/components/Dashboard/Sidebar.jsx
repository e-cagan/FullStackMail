import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, unreadCount = 0 }) => {
  const tabs = [
    { id: 'inbox', name: 'Inbox', icon: 'inbox', count: unreadCount },
    { id: 'read', name: 'Read', icon: 'envelope-open' },
    { id: 'sent', name: 'Sent', icon: 'paper-plane' },
    { id: 'spam', name: 'Spam', icon: 'shield-exclamation' },
    { id: 'archived', name: 'Archived', icon: 'archive' }
  ];

  const getIcon = (icon) => {
    switch (icon) {
      case 'inbox':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        );
      case 'envelope-open':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        );
      case 'paper-plane':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        );
      case 'shield-exclamation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"></path>
          </svg>
        );
      case 'archive':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
        );        
      default:
        return null;
    }
  };

  return (
    <div className="w-full md:w-64 bg-white p-4 shadow-md mb-4 md:mb-0 md:mr-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Folders</h2>
      <ul>
        {tabs.map((tab) => (
          <li key={tab.id} className="mb-2">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{getIcon(tab.icon)}</span>
              <span className="flex-grow text-left">{tab.name}</span>
              {tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;