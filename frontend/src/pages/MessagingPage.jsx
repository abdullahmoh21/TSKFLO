import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaUser,
  FaPaperPlane,
  FaCommentMedical,
  FaSearch,
  FaTimes,
  FaCheck,
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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentUserId = useSelector(selectCurrentUserId);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const socket = getSocket();

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

  // UPDATED: This just updates the search input.
  // We no longer filter mock results here, because we rely on RTK Query data.
  const handleSearchUsers = (query) => {
    setSearchUser(query);
  };

  // Handle user selection
  const toggleUserSelection = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Existing RTK Query calls
  const { data: conversations, isLoading: isLoadingConversations } =
    useGetAllConversationsQuery();
  // REMOVED the old line that didn’t pass arguments to useSearchUsersQuery()
  const { data: messages, isLoading: isLoadingMessages } = useGetMessagesQuery(
    selectedConversation,
    { skip: !selectedConversation }
  );
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
    } catch (error) {
      console.error("Failed to send message:", error);
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

  return (
    <div className="pt-16 h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>

            <div className="flex space-x-3">
              {/* Search Icon - Now blue */}
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="bg-white text-blue-500 hover:text-blue-700 focus:outline-none"
                title="Search"
              >
                <FaSearch size={18} />
              </button>

              {/* New Conversation Icon */}
              <button
                onClick={() =>
                  document.getElementById("new-conversation-modal").showModal()
                }
                className="bg-white text-blue-500 hover:text-blue-700 focus:outline-none"
                title="Create new conversation"
              >
                <FaCommentMedical size={18} />
              </button>

              {/* Modal for creating new conversation */}
              <dialog
                id="new-conversation-modal"
                className="p-6 rounded-lg shadow-xl fixed top-1/2 left-1/2 
             transform -translate-x-1/2 -translate-y-1/2 z-50 
             bg-white w-96 max-w-md"
              >
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
                  New Conversation
                </h3>
                <form onSubmit={handleCreateConversation}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Find people to chat with
                    </label>
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      placeholder="Search by name or email"
                      className="w-full p-2 border rounded-md 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   bg-white text-gray-900"
                    />
                  </div>

                  {/* Search Results */}
                  {isLoadingSearching ? (
                    <p className="mb-4 text-gray-700">Searching...</p>
                  ) : searchResults.length > 0 ? (
                    <div className="mb-4 max-h-40 overflow-y-auto border rounded-md bg-white">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => toggleUserSelection(user)}
                          className={`flex items-center justify-between p-2 cursor-pointer 
                        ${
                          selectedUsers.some((u) => u._id === user._id)
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                              <FaUser className="text-black" size={12} />
                            </div>
                            <div>
                              {/* Force a dark text color for the name */}
                              <p className="font-medium text-sm text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {selectedUsers.some((u) => u._id === user._id) && (
                            <FaCheck className="text-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-4 text-gray-700">No users found.</p>
                  )}

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected ({selectedUsers.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <div
                            key={user._id}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                          >
                            {user.name}
                            <button
                              type="button"
                              onClick={() => toggleUserSelection(user)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-4">
                    {/* Make sure Cancel button has a light background & dark text */}
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
                      className="px-4 py-2 border rounded-md text-gray-700 bg-white 
                   hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={selectedUsers.length === 0}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
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
              className="relative p-4 border-b border-gray-200"
            >
              <input
                type="text"
                className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button
                onClick={() => setShowSearchBar(false)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Close search"
              >
                <FaTimes size={16} />
              </button>
            </div>
          )}

          {/* Conversation List */}
          <div className="divide-y divide-gray-200">
            {isLoadingConversations ? (
              <div className="p-4 text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-gray-500">No conversations found.</div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                    selectedConversation === conversation._id
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {getConversationName(conversation)}
                        </h3>
                        <span className="text-xs text-gray-500">
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
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage
                          ? conversation.lastMessage.text
                          : "No messages yet..."}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {conversations?.find((c) => c._id === selectedConversation)
                    ? getConversationName(
                        conversations.find(
                          (c) => c._id === selectedConversation
                        )
                      )
                    : "Loading..."}
                </h3>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                  </div>
                ) : messages?.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages?.map((message) => (
                      <div
                        key={message._id}
                        className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                          message.sender._id === currentUserId
                            ? "ml-auto bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p>{message.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.sender._id === currentUserId
                              ? "text-blue-200"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!messageText.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-lg">
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
