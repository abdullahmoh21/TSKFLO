import React, { useState } from "react";
import { FaUser, FaPaperPlane } from "react-icons/fa";

const MessagingPage = () => {
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
        { id: 3, sender: "Adam", text: "Can you aprove the Pr?", time: "Yesterday" },
      ]
    },
    {
      id: 2,
      name: "Breeto Codes",
      lastMessage: "Meeting scheduled for tomorrow",
      unread: false,
      messages: [
        { id: 1, sender: "John", text: "Meeting scheduled for tomorrow", time: "Yesterday" },
        { id: 2, sender: "You", text: "I'll be there", time: "Yesterday" },
        { id: 3, sender: "Alex", text: "Great, see you all then!", time: "Yesterday" },
      ]
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    // Don't send empty messages
    if (!messageInput.trim()) return;
    
    // Get current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
    
    // Create a new message
    const newMessage = {
      id: conversationList[selectedConversation].messages.length + 1,
      sender: "You",
      text: messageInput,
      time: timeString
    };
    
    // Create a copy of the conversations array
    const updatedConversations = [...conversationList];
    
    // Add the new message to the selected conversation
    updatedConversations[selectedConversation] = {
      ...updatedConversations[selectedConversation],
      lastMessage: messageInput,
      messages: [...updatedConversations[selectedConversation].messages, newMessage]
    };
    
    // Update the state
    setConversationList(updatedConversations);
    
    // Clear the input field
    setMessageInput("");
  };

  return (
    <div className="pt-16 h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {conversationList.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                  selectedConversation === conversation.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                    {conversation.unread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500">12:34 PM</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          {selectedConversation !== null ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  <FaUser className="text-gray-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-800">
                  {conversationList[selectedConversation].name}
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {conversationList[selectedConversation].messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "You" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                          message.sender === "You"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <div className="flex flex-col">
                          {message.sender !== "You" && (
                            <span className="text-xs font-medium mb-1">
                              {message.sender}
                            </span>
                          )}
                          <p className="text-sm">{message.text}</p>
                          <span className="text-xs self-end mt-1 opacity-75">
                            {message.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage; 