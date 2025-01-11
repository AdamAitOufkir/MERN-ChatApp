import { useAuthStore } from "../store/useAuthStore";

const BlockedMessage = ({ user, isBlockedByMe, isBlockedByThem }) => {
  const { unblockUser } = useAuthStore();

  return (
    <div className="p-4 text-center bg-base-200">
      {isBlockedByMe ? (
        <div>
          <p className="mb-2">You have blocked {user.fullName}</p>
          <button
            onClick={() => unblockUser(user._id)}
            className="btn btn-primary btn-sm"
          >
            Unblock User
          </button>
        </div>
      ) : isBlockedByThem ? (
        <p>You have been blocked by {user.fullName}</p>
      ) : null}
    </div>
  );
};

export default BlockedMessage;
