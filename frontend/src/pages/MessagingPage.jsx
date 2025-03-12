import React, { useState } from "react";
import { FaUser, FaPaperPlane, FaCommentMedical, FaSearch, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectCurrentUserId, selectCurrentUserName } from "../features/auth/authSlice";
import { useSearchUsersQuery } from "../features/user/userApiSlice";

const MessagingPage = () => {
  const currentUserId = useSelector(selectCurrentUserId);
  const currentUserName = useSelector(selectCurrentUserName);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  
  // Create a state to store conversations so we can update them
  const [conversationList, setConversationList] = useState([
    {
      id: 0,
      name: "Jimmy",
      lastMessage: "Hey, how's it going?",
      unread: true,
      messages: [
        { id: 1, sender: "Jimmy", text: "Hey, how's it going?", time: "10:30 AM" },
        { id: 2, sender: "You", text: "I'm good, thanks! How about you?", time: "10:32 AM" },
        { id: 3, sender: "Jimmy", text: "Doing well. Just checking in about the project.", time: "10:35 AM" },
      ]
    },
    {
      id: 1,
      name: "Adam",
      lastMessage: "Can you send me the report?",
      unread: false,
      messages: [
        { id: 1, sender: "Adam", text: "Hi there!", time: "Yesterday" },
        { id: 2, sender: "You", text: "Hello! How can I help you?", time: "Yesterday" },
        { id: 3, sender: "Adam", text: "Can you approve the PR?", time: "Yesterday" },
      ]
    },
    {
      id: 2,
      name: "Sarah",
      lastMessage: "Thanks for your help!",
      unread: false,
      messages: [
        { id: 1, sender: "Sarah", text: "Do you have time to review my task?", time: "Monday" },
        { id: 2, sender: "You", text: "Sure, I'll take a look at it today.", time: "Monday" },
        { id: 3, sender: "Sarah", text: "Thanks for your help!", time: "Monday" },
      ]
    }
  ]);

  // Function to handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Create a new message
    const newMessage = {
      id: conversationList[selectedConversation].messages.length + 1,
      sender: "You",
      text: messageInput.trim(),
      time: "Just now"
    };

    // Update the conversation with the new message
    const updatedConversations = [...conversationList];
    updatedConversations[selectedConversation].messages.push(newMessage);
    updatedConversations[selectedConversation].lastMessage = messageInput.trim();
    
    setConversationList(updatedConversations);
    setMessageInput("");
  };

  return (
    <div className="min-h-screen pt-16 bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-morphism rounded-xl shadow-md overflow-hidden">
          <div className="flex h-[calc(100vh-150px)]">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Messages</h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                {conversationList.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-secondary-200 dark:border-secondary-700 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors ${
                      selectedConversation === conversation.id ? "bg-primary-50 dark:bg-primary-900/30" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <FaUser />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-secondary-900 dark:text-white">{conversation.name}</p>
                          {conversation.unread && (
                            <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-secondary-800">
              {/* Conversation Header */}
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <FaUser />
                </div>
                <h3 className="ml-3 font-medium text-secondary-900 dark:text-white">
                  {conversationList[selectedConversation]?.name}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationList[selectedConversation]?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "You"
                          ? "bg-primary-500 text-white"
                          : "bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "You" ? "text-primary-100" : "text-secondary-500 dark:text-secondary-400"
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 p-2 border border-secondary-300 dark:border-secondary-600 rounded-l-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-r-lg transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-secondary-500 dark:text-secondary-400">
          <p>Note: This is a demo messaging interface. Real-time functionality is not available in this version.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
