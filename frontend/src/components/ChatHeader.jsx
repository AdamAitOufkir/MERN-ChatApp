import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import Profile from "./Profile";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State to toggle profile modal

  return (
    <div>
      <div className="p-2.5 border-b border-base-300 hover:bg-base-300">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3">
            {/* Close button */}
            <button onClick={() => setSelectedUser(null)}>
              <ArrowLeft />
            </button>
            {/* Avatar */}
            <div
              className="avatar cursor-pointer"
              onClick={() => setIsProfileOpen(true)} // Open profile modal on click
            >
              <div className="size-10 rounded-full relative">
                <img
                  src={authUser.blockedByUsers?.includes(selectedUser._id) 
                    ? "/avatar.png" 
                    : (selectedUser.profilePic || "/avatar.png")}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>

            {/* User info */}
            <div
              className="w-96 cursor-pointer"
              onClick={() => setIsProfileOpen(true)} // Open profile modal on click
            >
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {selectedUser.blockedUsers?.includes(authUser._id)
                  ? "Offline"
                  : (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <Profile
          user={selectedUser} // Pass the selected user's data
          onClose={() => setIsProfileOpen(false)} // Close modal function
        />
      )}
    </div>
  );
};

export default ChatHeader;
