import { ArrowLeft, Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import Profile from "./Profile";
import VideoCall from "./VideoCall";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, initiateCall, currentCall } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleCall = async (isVideo) => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      initiateCall(selectedUser._id, isVideo);
    } catch (err) {
      toast.error(
        "Failed to access camera/microphone. Please grant permissions.",
        err
      );
    }
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
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div
              className="w-96 cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Call buttons */}
          <div className="flex gap-2">
            <button
              className="btn btn-circle btn-ghost"
              onClick={() => handleCall(false)}
              disabled={!onlineUsers.includes(selectedUser._id)}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="btn btn-circle btn-ghost"
              onClick={() => handleCall(true)}
              disabled={!onlineUsers.includes(selectedUser._id)}
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

      {currentCall && <VideoCall />}
    </div>
  );
};

export default ChatHeader;
