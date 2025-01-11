import { X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const Profile = ({ user, onClose }) => {
  const { authUser, blockUser, unblockUser } = useAuthStore();
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  
  const isBlocked = authUser?.blockedUsers?.includes(user._id);
  const isBlockedByThem = authUser?.blockedByUsers?.includes(user._id);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="bg-base-300 p-6 rounded-lg max-w-sm w-full relative shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          <X />
        </button>

        {/* User Avatar */}
        <div className="flex flex-col items-center">
          <div
            className="avatar cursor-pointer mb-4"
            onClick={() => setIsImagePreviewOpen(true)}
          >
            <div className="size-40 rounded-full">
              <img 
                src={authUser.blockedByUsers?.includes(user._id) ? "/avatar.png" : (user.profilePic || "/avatar.png")} 
                alt={user.fullName} 
              />
            </div>
          </div>

          {/* User Info */}
          <h2 className="text-center text-xl font-bold mb-2">
            {user.fullName}
          </h2>
          <p className="text-center text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-2">
          {!isBlockedByThem && (
            <button
              onClick={() => isBlocked ? unblockUser(user._id) : blockUser(user._id)}
              className={`w-full py-2 ${
                isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              } text-white font-bold rounded-lg`}
            >
              {isBlocked ? "Unblock User" : "Block User"}
            </button>
          )}
          <button className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg">
            Delete All Messages
          </button>
        </div>
      </div>
      {/* Image Preview Modal */}
      {isImagePreviewOpen && (
        <div
          className="fixed inset-0 z-60 bg-black bg-opacity-75 flex items-center justify-center"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <img
            src={user.profilePic || "/avatar.png"}
            alt={user.fullName}
            className="max-w-[80%] max-h-[80%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
