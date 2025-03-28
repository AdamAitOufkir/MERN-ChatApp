import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  // Move all hooks to the top, before any conditional logic
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { socket, authUser, unblockUser } = useAuthStore();

  // Define blocking checks after hooks
  const isBlockedByMe = authUser?.blockedUsers?.includes(selectedUser?._id);
  const isBlockedByThem = selectedUser?.blockedUsers?.includes(authUser?._id);

  // Add early return if no selected user
  if (!selectedUser) return null;

  // Move useEffect outside of conditional logic
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        emitTyping(false);
      }
    };
  }, [selectedUser?._id]);

  const emitTyping = (isTyping) => {
    if (socket && selectedUser && authUser) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
        senderId: authUser._id,
        isTyping,
      });
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isBlockedByMe || isBlockedByThem) {
    return (
      <div className="p-4">
        <div className="p-4 text-center bg-base-200 rounded-lg">
          {isBlockedByMe ? (
            <div>
              <p className="mb-2">You have blocked {selectedUser.fullName}</p>
              {!isBlockedByThem && ( // Only show unblock button if they haven't blocked you
                <button
                  onClick={() => unblockUser(selectedUser._id)}
                  className="btn btn-primary btn-sm"
                >
                  Unblock User
                </button>
              )}
            </div>
          ) : (
            <p>You have been blocked by {selectedUser.fullName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full max-w-full">
      {" "}
      {/* Added max-w-full */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 max-w-full"
      >
        {" "}
        {/* Added max-w-full */}
        <div className="flex-1 flex gap-2 min-w-0">
          {" "}
          {/* Added min-w-0 to prevent flex child overflow */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md text-ellipsis"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`btn btn-sm btn-circle self-center
                     ${imagePreview ? "text-primary" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()} //reference the file input above (because its hidden)
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
