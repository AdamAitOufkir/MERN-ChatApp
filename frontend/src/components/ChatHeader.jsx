import { ArrowLeft, Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import Profile from "./Profile";
import toast from "react-hot-toast";
import { useSound } from "../hooks/useSound";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, initiateCall } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State to toggle profile modal
  const { playSound } = useSound();

  const handleCall = async (isVideo) => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      initiateCall(selectedUser._id, isVideo);
      playSound("outgoing", true); // Play outgoing call sound in loop
    } catch (err) {
      toast.error(
        "Failed to access camera/microphone. Please grant permissions.",
        err
      );
    }
  };

  const isCallDisabled = () => {
    return (
      !onlineUsers.includes(selectedUser._id) ||
      selectedUser.blockedUsers?.includes(authUser._id) ||
      authUser.blockedUsers?.includes(selectedUser._id)
    );
  };

  return (
    <div>
      <div className="p-2.5 border-b border-base-300 hover:bg-base-300">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedUser(null)}>
              <ArrowLeft />
            </button>
            <div
              className="avatar cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <div className="size-10 rounded-full relative">
                <img
                  src={
                    authUser.blockedByUsers?.includes(selectedUser._id)
                      ? "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div
              className="lg:w-96 md:w-80  cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {selectedUser.blockedUsers?.includes(authUser._id)
                  ? "Offline"
                  : onlineUsers.includes(selectedUser._id)
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>

          {/* Call buttons */}
          <div className="flex gap-2">
            <button
              className="btn btn-circle btn-ghost"
              onClick={() => handleCall(false)}
              disabled={isCallDisabled()}
              title={
                isCallDisabled()
                  ? "Calls are disabled when users are blocked"
                  : "Voice Call"
              }
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="btn btn-circle btn-ghost"
              onClick={() => handleCall(true)}
              disabled={isCallDisabled()}
              title={
                isCallDisabled()
                  ? "Calls are disabled when users are blocked"
                  : "Video Call"
              }
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <Profile user={selectedUser} onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
};

export default ChatHeader;
