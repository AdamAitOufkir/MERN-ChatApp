import { Phone, Video, PhoneOff } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const CallNotification = ({ callData, onAccept, onReject }) => {
  const { users } = useChatStore();
  const caller = users.find((user) => user._id === callData.from);

  return (
    <div className="fixed top-4 right-4 z-50 w-80 p-4 bg-base-200 rounded-lg shadow-lg">
      <div className="flex items-center gap-4">
        <div className="avatar">
          <div className="w-12 h-12 rounded-full">
            <img src={caller?.profilePic || "/avatar.png"} alt="Caller" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{caller?.fullName}</h3>
          <p className="text-sm text-base-content/70">
            Incoming {callData.isVideoCall ? "video" : "voice"} call...
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="btn btn-circle btn-sm btn-success"
          >
            {callData.isVideoCall ? <Video size={18} /> : <Phone size={18} />}
          </button>
          <button
            onClick={onReject}
            className="btn btn-circle btn-sm btn-error"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
