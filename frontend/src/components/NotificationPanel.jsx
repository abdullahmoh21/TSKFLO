import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBell, 
  FaTimes, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaRegClock,
  FaUserPlus
} from 'react-icons/fa';

const NotificationPanel = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  
  // Mock notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'deadline',
      message: 'Task "Complete project presentation" is due tomorrow',
      time: '1 hour ago',
      read: false
    },
    {
      id: 2,
      type: 'assignment',
      message: 'You were assigned to "Review code PR-123"',
      time: '3 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'completion',
      message: 'Task "Setup development environment" was marked as complete',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'mention',
      message: 'John mentioned you in a comment on "Backend API integration"',
      time: '2 days ago',
      read: true
    }
  ]);
  
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deadline':
        return <FaRegClock className="text-warning-500" />;
      case 'assignment':
        return <FaUserPlus className="text-info-500" />;
      case 'completion':
        return <FaCheckCircle className="text-success-500" />;
      default:
        return <FaBell className="text-primary-500" />;
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50 animate-slide-down"
    >
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-secondary-700 flex justify-between items-center">
          <h3 className="font-medium text-gray-700 dark:text-white flex items-center">
            <FaBell className="mr-2 text-primary-500 dark:text-primary-400" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={markAllAsRead}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
            >
              Mark all as read
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        
        {/* Notification List */}
        <div className="divide-y divide-gray-100 dark:divide-secondary-700">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              No notifications to display
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-primary-900/20' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-secondary-700 text-center">
          <button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel; 