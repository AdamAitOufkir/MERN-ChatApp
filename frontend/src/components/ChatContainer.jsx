import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Forward, X, Search, Send, Trash2 } from "lucide-react";
import { ChevronDown } from "lucide-react";
import TypingIndicator from "./TypingIndicator";
import { axiosInstance } from "../lib/axios"; // Add this import

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    setSelectedUser, // Add this
    subscribeToMessages,
    unsubscribeFromMessages,
    contacts,
    isTyping,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null); // State for preview modal
  const [visibleDropdown, setVisibleDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const dropdownRef = useRef(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Modify the existing useEffect for scrolling
  useEffect(() => {
    if (messageEndRef.current && (messages || isTyping)) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]); // Add isTyping as dependency

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        visibleDropdown &&
        !event.target.closest(".dropdown-container") &&
        !event.target.closest(".deletebutton")
      ) {
        setVisibleDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visibleDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add debug log to check typing state
  useEffect(() => {
    console.log("Typing state changed:", isTyping);
  }, [isTyping]);

  // Remove the duplicate useEffects and combine them into one comprehensive effect
  useEffect(() => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      const handleBlockUpdate = async () => {
        try {
          // Get fresh user data
          const response = await axiosInstance.get(
            `/auth/user/${selectedUser._id}`
          );
          const freshUserData = response.data;

          // Update the selected user with fresh data
          setSelectedUser(freshUserData);

          // Force re-render of messages by getting them again
          await getMessages(selectedUser._id);
        } catch (error) {
          console.error("Error updating user data:", error);
        }
      };

      socket.on("userBlockedUpdate", handleBlockUpdate);
      socket.on("userUnblockedUpdate", handleBlockUpdate);

      return () => {
        socket.off("userBlockedUpdate", handleBlockUpdate);
        socket.off("userUnblockedUpdate", handleBlockUpdate);
      };
    }
  }, [selectedUser?._id, getMessages, setSelectedUser]);

  const toggleDropdown = (messageId) => {
    setVisibleDropdown((prev) => {
      const newValue = prev === messageId ? null : messageId;
      // Add scroll logic when dropdown is opened
      if (newValue) {
        setTimeout(() => {
          const dropdownElement = document.querySelector(".deletebutton");
          if (dropdownElement) {
            const dropdownRect = dropdownElement.getBoundingClientRect();
            const containerElement = document.querySelector(".overflow-y-auto");
            const containerRect = containerElement.getBoundingClientRect();

            // Check if dropdown extends below container viewport
            if (dropdownRect.bottom > containerRect.bottom) {
              containerElement.scrollBy({
                top: dropdownRect.bottom - containerRect.bottom + 16, // adding padding
                behavior: "smooth",
              });
            }
          }
        }, 0);
      }
      return newValue;
    });
  };

  const closeModal = () => setPreviewImage(null); // Close modal function

  const handleTransferClick = (messageId) => {
    setSelectedMessageId(messageId);
    setShowTransferModal(true);
    setVisibleDropdown(null);
    setSearchQuery("");
  };

  const messageDropdown = (message) => (
    <ul
      className={`deletebutton absolute mt-6 w-48 bg-base-200 shadow-lg rounded-lg py-2 z-50 ${
        message.senderId === authUser._id ? "right-0" : "left-0"
      }`}
    >
      <li>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTransferClick(message._id);
          }}
          className="flex px-4 py-2 text-sm text-blue-600 hover:bg-base-300 w-full text-left items-center justify-between"
        >
          <span>Transfer Message</span>
          <Forward className="w-4 h-4 text-blue-600" />
        </button>
      </li>
      {message.senderId === authUser._id && (
        <li>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVisibleDropdown(null);
              useChatStore.getState().deleteMessage(message._id, false); // added false to prevent success toast
            }}
            className="px-4 py-2 text-sm text-red-600 hover:bg-base-300 w-full text-left flex items-center justify-between"
          >
            <span>Delete Message</span>
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </li>
      )}
    </ul>
  );

  const TransferModal = () => {
    const { authUser } = useAuthStore(); // Add this line

    const filteredContacts = contacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !contact.blockedUsers?.includes(authUser._id) &&
        !authUser.blockedUsers?.includes(contact._id)
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          ref={modalRef}
          className="bg-base-200 rounded-2xl w-full max-w-md mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-base-300 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transfer Message</h3>
            <button
              onClick={() => setShowTransferModal(false)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search contacts..."
                className="input input-bordered w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-base-content/70">
                  No available contacts found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact._id}
                      disabled={isTransferring}
                      onClick={async () => {
                        setIsTransferring(true);
                        try {
                          await useChatStore
                            .getState()
                            .transferMessage(selectedMessageId, contact._id);
                          setShowTransferModal(false);
                          setSearchQuery("");
                        } finally {
                          setIsTransferring(false);
                        }
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-base-300 rounded-lg transition-colors"
                    >
                      <img
                        src={contact.profilePic || "/avatar.png"}
                        alt={contact.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{contact.fullName}</div>
                      </div>
                      <Send className="w-4 h-4 text-base-content/50" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {" "}
      {/* Changed from overflow-auto to overflow-hidden */}
      <ChatHeader />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
        {" "}
        {/* Added overflow-x-hidden */}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
            data-message-id={message._id}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser?.blockedUsers?.includes(authUser?._id)
                      ? "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                  className="transition-opacity duration-200" // Add transition
                  loading="lazy"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              {message.transferred && (
                <div className="text-sm text-gray-500 italic">
                  <p className="italic font-thin ml-1 flex items-center">
                    <Forward />
                    Forwarded
                  </p>
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              )}
            </div>

            <div
              className={`chat-bubble flex items-start pr-8 rounded-2xl ${
                message.senderId === authUser._id ? "bg-primary" : "bg-base-200"
              } relative group max-w-[80%] break-words`} // Added max-w-[80%] and break-words
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="max-w-full rounded-md mb-2 cursor-pointer" // Changed from sm:max-w-[200px] to max-w-full
                  onClick={() => setPreviewImage(message.image)}
                />
              )}
              {message.text && (
                <p
                  className={`${
                    message.senderId === authUser._id
                      ? "text-primary-content"
                      : "text-base-content"
                  } overflow-hidden`} // Added overflow-hidden
                >
                  {message.text}
                </p>
              )}
              {message.senderId === authUser._id ? (
                <>
                  {/* Chevron Down Button */}
                  <button
                    onClick={() => toggleDropdown(message._id)}
                    className="absolute top-2 right-2 hidden group-hover:inline-block btn btn-sm btn-ghost p-0 m-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown */}
                  {visibleDropdown === message._id && messageDropdown(message)}
                </>
              ) : (
                <>
                  {/* Chevron Down Button */}
                  <button
                    onClick={() => toggleDropdown(message._id)}
                    className="absolute top-2 right-2 hidden group-hover:inline-block btn btn-sm btn-ghost p-0 m-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown */}
                  {visibleDropdown === message._id && messageDropdown(message)}
                </>
              )}
            </div>
            {/* Add seen indicator */}
            {message.senderId === authUser._id && (
              <div className="chat-footer opacity-50">
                <div className="flex items-center gap-1">
                  <div
                    className={`size-2 rounded-full ${
                      message.seen ? "bg-blue-500" : "bg-gray-500"
                    }`}
                  ></div>
                  {message.seen ? "Seen" : "Sent"}
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div ref={messageEndRef}>
            <TypingIndicator selectedUser={selectedUser} />
          </div>
        )}
      </div>
      <MessageInput />
      {/* Transfer Modal */}
      {showTransferModal && <TransferModal />}
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeModal} // Close modal on backdrop click
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-md"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={closeModal}
          >
            <X />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
