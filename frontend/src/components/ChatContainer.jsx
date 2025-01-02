import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { X } from "lucide-react";
import { ChevronDown } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null); // State for preview modal
  const [visibleDropdown, setVisibleDropdown] = useState(null);

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

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  const toggleDropdown = (messageId) => {
    setVisibleDropdown((prev) => (prev === messageId ? null : messageId));
  };

  const closeModal = () => setPreviewImage(null); // Close modal function

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex items-start pr-8 rounded-2xl ${
                message.senderId === authUser._id ? "bg-primary" : "bg-base-200"
              } relative group`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                  onClick={() => setPreviewImage(message.image)} // Set image to preview
                />
              )}
              {message.text && (
                <p
                  className={`${
                    message.senderId === authUser._id
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  {message.text}
                </p>
              )}
              {message.senderId === authUser._id && (
                <>
                  {/* Chevron Down Button */}
                  <button
                    onClick={() => toggleDropdown(message._id)}
                    className="absolute top-2 right-2 hidden group-hover:inline-block btn btn-sm btn-ghost p-0 m-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown */}
                  {visibleDropdown === message._id && (
                    <ul
                      className="deletebutton absolute right-0 mt-6 w-40 bg-base-200 shadow-md rounded-lg py-1 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisibleDropdown(null);
                            useChatStore.getState().deleteMessage(message._id);
                          }}
                          className="block px-4 py-2 text-sm text-red-500 hover:bg-base-300"
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

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
