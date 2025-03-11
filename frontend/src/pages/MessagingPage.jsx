import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaUser,
  FaPaperPlane,
  FaCommentMedical,
  FaSearch,
  FaTimes,
  FaCheck,
  FaEllipsisH,
  FaArrowLeft,
  FaPaperclip,
  FaSmile,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  useGetAllConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
} from "../features/messages/messageApiSlice";
import { useSearchUsersQuery } from "../features/user/userApiSlice";
import { selectCurrentUserId } from "../features/auth/authSlice";
import { getSocket } from "../services/socketService";

const MessagingPage = () => {
  // State for user search input and results
  const [searchUser, setSearchUser] = useState("");
  const [groupName, setGroupName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentUserId = useSelector(selectCurrentUserId);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const socket = getSocket();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const { data: searchResult, isLoading: isLoadingSearching } =
    useSearchUsersQuery(debouncedSearchTerm, {
      skip: !debouncedSearchTerm,
    });

  // Every time `searchUser` changes, wait 500ms before updating `debouncedSearchTerm`
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchUser.trim());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchUser]);

  useEffect(() => {
    if (searchResult && searchResult.users) {
      // Filter out the current user
      setSearchResults(
        searchResult.users.filter((user) => user._id !== currentUserId)
      );
    } else {
      setSearchResults([]);
    }
  }, [searchResult, currentUserId]);

  // Existing state variables
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newParticipantId, setNewParticipantId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [messageText, setMessageText] = useState("");
  const searchRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const toggleUserSelection = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const { data: conversations, isLoading: isLoadingConversations } =
    useGetAllConversationsQuery();
  const {
    data: messages,
    isLoading: isLoadingMessages,
    refetch,
  } = useGetMessagesQuery(selectedConversation, {
    skip: !selectedConversation,
  });
  const [createConversation] = useCreateConversationMutation();
  const [createMessage] = useCreateMessageMutation();

  // Get other participant name for conversation display
  const getConversationName = (conversation) => {
    // First check if conversation and participants exist
    if (!conversation || !conversation.participants) return "Unknown";

    // If it has a group name, use that
    if (conversation.groupName) {
      return conversation.groupName;
    }

    // Safety check for participants array length
    if (conversation.participants.length === 0) {
      return "Empty conversation";
    }

    // If there's only one participant, return their name
    if (conversation.participants.length === 1) {
      return conversation.participants[0]?.name || "Unknown User";
    }

    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants.find(
      (participant) => participant._id !== currentUserId
    );

    // If found, return their name, otherwise use the first participant's name
    return (
      otherParticipant?.name ||
      conversation.participants[0]?.name ||
      "Unknown User"
    );
  };

  // Helper to identify if a conversation is a group chat
  const isGroupChat = (conversation) => {
    if (!conversation) return false;
    // Consider it a group chat if it has a group name or more than 2 participants
    return (
      conversation.groupName ||
      (conversation.participants && conversation.participants.length > 2)
    );
  };

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter((conv) => {
      const name = getConversationName(conv).toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    try {
      // Send as an array of participant IDs with current user included
      await createConversation({
        participants: [currentUserId, ...selectedUsers.map((user) => user._id)],
        groupName: groupName,
      }).unwrap();

      setSelectedUsers([]);
      document.getElementById("new-conversation-modal").close();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation. Check console for details.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await createMessage({
        conversationId: selectedConversation,
        messageData: { text: messageText.trim() },
      }).unwrap();
      setMessageText("");
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const focusMessageInput = () => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Scroll to bottom of messages on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Hide search bar when clicking outside or hitting Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setShowSearchBar(false);
      }
    }

    if (showSearchBar) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showSearchBar]);

  useEffect(() => {
    // Once conversations are fetched and socket is available, join each room
    if (socket && conversations) {
      conversations.forEach((conversation) => {
        socket.emit("joinConversation", conversation._id);
        console.log(`Joined room for conversation: ${conversation._id}`);
      });
    }
  }, [socket, conversations]);

  // Handle mobile view switching
  useEffect(() => {
    // When a conversation is selected on mobile, hide the sidebar
    if (selectedConversation && window.innerWidth < 768) {
      setShowMobileMenu(false);
    }
    
    // Reset mobile view on window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedConversation]);

  return (
    <div className="h-screen flex flex-col bg-secondary-50 dark:bg-secondary-900">
      <div className="pt-16 flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Conversation List */}
          <div className={`${showMobileMenu ? "block" : "hidden"} md:block w-full md:w-96 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex-shrink-0 overflow-y-auto transition-all duration-300 relative`}>
            {/* Header */}
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between bg-white dark:bg-secondary-800 sticky top-0 z-10 shadow-sm">
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-white">Messages</h2>

              <div className="flex space-x-3">
                {/* Search Icon */}
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="bg-secondary-100 dark:bg-secondary-700 text-primary-600 dark:text-primary-400 p-2 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="Search"
                >
                  <FaSearch size={16} />
                </button>

                {/* New Conversation Icon */}
                <button
                  onClick={() =>
                    document.getElementById("new-conversation-modal").showModal()
                  }
                  className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="Create new conversation"
                >
                  <FaCommentMedical size={16} />
                </button>

                {/* Modal for creating new conversation */}
                <dialog
                  id="new-conversation-modal"
                  className="p-0 rounded-lg shadow-xl fixed top-[35%] left-1/2 
                  transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-secondary-800
                  w-11/12 max-w-md max-h-[80vh] overflow-hidden border border-secondary-200 dark:border-secondary-700"
                >
                  <div className="bg-primary-600 text-white p-4">
                    <h3 className="text-xl font-semibold text-center">
                      New Conversation
                    </h3>
                  </div>

                  <form onSubmit={handleCreateConversation} className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Participants
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          placeholder="Search by name or email"
                          className="w-full p-3 border rounded-lg 
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white
                        border-secondary-300 dark:border-secondary-600"
                        />
                        {searchUser && (
                          <button
                            type="button"
                            onClick={() => setSearchUser("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                          >
                            <FaTimes size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search Results */}
                    {!searchUser.trim() ? null : isLoadingSearching ? (
                      <div className="mb-4 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="mb-4 max-h-48 overflow-y-auto border rounded-lg bg-white dark:bg-secondary-700 border-secondary-200 dark:border-secondary-600 divide-y divide-secondary-200 dark:divide-secondary-600">
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => toggleUserSelection(user)}
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors duration-150
                          ${
                            selectedUsers.some((u) => u._id === user._id)
                              ? "bg-primary-50 dark:bg-primary-900/30"
                              : "hover:bg-secondary-50 dark:hover:bg-secondary-700/70"
                          }`}
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mr-3 text-primary-600 dark:text-primary-300">
                                <FaUser size={16} />
                              </div>
                              <div>
                                <p className="font-medium text-secondary-900 dark:text-white">
                                  {user.name}
                                </p>
                                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            {selectedUsers.some((u) => u._id === user._id) && (
                              <div className="bg-primary-500 text-white p-1 rounded-full">
                                <FaCheck size={12} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-4 text-secondary-500 dark:text-secondary-400 text-center py-2">No users found.</p>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Selected ({selectedUsers.length})
                        </label>
                        <div className="flex flex-wrap gap-2 bg-secondary-50 dark:bg-secondary-700/50 p-3 rounded-lg">
                          {selectedUsers.map((user) => (
                            <div
                              key={user._id}
                              className="bg-primary-100 dark:bg-primary-800/60 text-primary-800 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm flex items-center"
                            >
                              {user.name}
                              <button
                                type="button"
                                onClick={() => toggleUserSelection(user)}
                                className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 focus:outline-none"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Group Name */}
                    {selectedUsers.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                          Group Name
                        </label>
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="w-full p-3 border rounded-lg 
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white
                        border-secondary-300 dark:border-secondary-600"
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          document
                            .getElementById("new-conversation-modal")
                            .close();
                          setSearchUser("");
                          setSearchResults([]);
                          setSelectedUsers([]);
                        }}
                        className="px-4 py-2 border rounded-lg text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800
                        hover:bg-secondary-50 dark:hover:bg-secondary-700 border-secondary-300 dark:border-secondary-600
                        transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={selectedUsers.length === 0}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                        disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors
                        focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        Start Chat
                      </button>
                    </div>
                  </form>
                </dialog>
              </div>
            </div>

            {/* Search Bar - Only Visible When Active */}
            {showSearchBar && (
              <div
                ref={searchRef}
                className="relative p-4 border-b border-secondary-200 dark:border-secondary-700 animate-fade-in"
              >
                <div className="relative">
                  <input
                    type="text"
                    className="w-full py-2 pl-10 pr-4 border border-secondary-300 dark:border-secondary-600 rounded-full 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500">
                    <FaSearch size={16} />
                  </div>
                  <button
                    onClick={() => setShowSearchBar(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 
                    hover:text-secondary-600 dark:hover:text-secondary-400 focus:outline-none"
                    title="Close search"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Conversation List */}
            <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {isLoadingConversations ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <div className="text-secondary-400 dark:text-secondary-500 mb-4">
                    <FaCommentMedical size={36} className="mx-auto" />
                  </div>
                  <p className="text-secondary-500 dark:text-secondary-400 mb-2">No conversations found</p>
                  <button
                    onClick={() => document.getElementById("new-conversation-modal").showModal()}
                    className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isActive = selectedConversation === conversation._id;
                  const hasUnread = conversation.unreadCount > 0;
                  
                  return (
                    <div
                      key={conversation._id}
                      className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 flex items-center
                      ${isActive ? "bg-primary-50 dark:bg-primary-900/30" : ""}`}
                      onClick={() => {
                        setSelectedConversation(conversation._id);
                        setShowMobileMenu(false);
                      }}
                    >
                      <div className="relative mr-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300">
                          <FaUser className="text-lg" />
                        </div>
                        {hasUnread && (
                          <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-secondary-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className={`text-base font-medium truncate ${isActive ? "text-primary-700 dark:text-primary-300" : "text-secondary-900 dark:text-white"}`}>
                            {getConversationName(conversation)}
                          </h3>
                          <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2 whitespace-nowrap">
                            {conversation.lastMessage
                              ? new Date(
                                  conversation.lastMessage.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          hasUnread 
                            ? "text-secondary-800 dark:text-secondary-200 font-medium" 
                            : "text-secondary-500 dark:text-secondary-400"
                        }`}>
                          {conversation.lastMessage
                            ? conversation.lastMessage.text
                            : "No messages yet..."}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`${!showMobileMenu ? "block" : "hidden"} md:block flex-1 flex flex-col bg-secondary-100 dark:bg-secondary-900 overflow-hidden`}>
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0">
                  {(() => {
                    const currentConversation = conversations?.find(
                      (c) => c._id === selectedConversation
                    );
                    const isGroup = isGroupChat(currentConversation);

                    return (
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              onClick={() => setShowMobileMenu(true)}
                              className="md:hidden mr-3 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
                            >
                              <FaArrowLeft size={18} />
                            </button>
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300 mr-3">
                                <FaUser size={16} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                                  {currentConversation
                                    ? getConversationName(currentConversation)
                                    : "Loading..."}
                                </h3>
                                {isGroup && (
                                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                    {currentConversation?.participants?.length || 0} members
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isGroup && (
                              <button
                                onClick={() => setShowParticipants(!showParticipants)}
                                className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 
                                hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-full transition-colors"
                              >
                                <FaUser size={16} />
                              </button>
                            )}
                            <button
                              className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 
                              hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-full transition-colors"
                            >
                              <FaEllipsisH size={16} />
                            </button>
                          </div>
                        </div>

                        {isGroup && showParticipants && currentConversation?.participants && (
                          <div className="mt-3 p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg animate-slide-up">
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">
                              Participants:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {currentConversation.participants.map(
                                (participant) => (
                                  <span
                                    key={participant._id}
                                    className="px-2.5 py-1 bg-primary-100 dark:bg-primary-800/60 text-primary-800 dark:text-primary-300 text-xs rounded-full"
                                  >
                                    {participant.name}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Messages Area */}
                <div 
                  className="flex-1 p-4 overflow-y-auto" 
                  onClick={focusMessageInput}
                >
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-secondary-500 dark:text-secondary-400 animate-fade-in">
                      <div className="bg-secondary-200 dark:bg-secondary-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <FaCommentMedical className="text-secondary-400 dark:text-secondary-500" size={24} />
                      </div>
                      <p className="mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message, index) => {
                        const currentConversation = conversations?.find(
                          (c) => c._id === selectedConversation
                        );
                        const isGroup = isGroupChat(currentConversation);
                        const isCurrentUser = message.sender._id === currentUserId;
                        const showDate = index === 0 || 
                          new Date(message.createdAt).toDateString() !== 
                          new Date(messages[index - 1].createdAt).toDateString();
                        
                        return (
                          <div key={message._id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <div className="bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs px-3 py-1 rounded-full">
                                  {new Date(message.createdAt).toLocaleDateString([], {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            )}
                            <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] animate-slide-up`}>
                                {/* Show sender name only in group chats and not for current user's messages */}
                                {isGroup && !isCurrentUser && (
                                  <div className="text-xs text-secondary-500 dark:text-secondary-400 ml-2 mb-1">
                                    {message.sender.name}
                                  </div>
                                )}
                                <div
                                  className={`p-3 rounded-2xl shadow-sm ${
                                    isCurrentUser
                                      ? "bg-primary-600 text-white rounded-br-none"
                                      : "bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-bl-none"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{message.text}</p>
                                  <div
                                    className={`text-xs mt-1 text-right ${
                                      isCurrentUser
                                        ? "text-primary-200"
                                        : "text-secondary-500 dark:text-secondary-400"
                                    }`}
                                  >
                                    {new Date(message.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input - Make sure it's at the bottom */}
                <div className="border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex-shrink-0 sticky bottom-0">
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-2 p-4">
                    <div className="flex-1 bg-secondary-100 dark:bg-secondary-700 rounded-2xl shadow-inner-glow px-4 py-3">
                      <textarea
                        ref={messageInputRef}
                        className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 text-secondary-900 dark:text-white overflow-auto"
                        placeholder="Type your message..."
                        rows="1"
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          // Auto-resize textarea
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (messageText.trim()) {
                              handleSendMessage(e);
                            }
                          }
                        }}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
                          >
                            <FaPaperclip size={18} />
                          </button>
                          <button
                            type="button"
                            className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
                          >
                            <FaSmile size={18} />
                          </button>
                        </div>
                        <p className="text-xs text-secondary-400 dark:text-secondary-500">
                          {messageText.length > 0 ? messageText.length : ''} 
                          {messageText.length > 500 ? '/1000' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        messageText.trim()
                          ? "bg-primary-600 text-white hover:bg-primary-700"
                          : "bg-secondary-300 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 cursor-not-allowed"
                      } transition-colors`}
                      disabled={!messageText.trim()}
                    >
                      <FaPaperPlane size={18} />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-secondary-100 dark:bg-secondary-900 animate-fade-in">
                <div className="text-center p-6 max-w-md">
                  <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                    <FaCommentMedical size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">No Conversation Selected</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                    Choose a conversation from the list or start a new one.
                  </p>
                  <button
                    onClick={() => {
                      setShowMobileMenu(true);
                      document.getElementById("new-conversation-modal").showModal();
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
