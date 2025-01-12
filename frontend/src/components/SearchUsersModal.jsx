import { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  UserPlus,
  CheckCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useDebounce from "../hooks/useDebounce";

const SearchUsersModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("search"); // "search" or "requests"
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { getUsers, contacts } = useChatStore();
  const {
    onlineUsers,
    authUser,
    incomingFriendRequests,
    outgoingFriendRequests,
    isLoadingFriendRequests,
    getIncomingFriendRequests,
    getOutgoingFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    isSendingFriendRequest,
  } = useAuthStore();

  useEffect(() => {
    if (debouncedSearch.length >= 1) {
      setIsSearching(true);
      // Get fresh user data before filtering
      getUsers().then(() => {
        const freshUsers = useChatStore.getState().users;
        const results = freshUsers.filter((user) =>
          user.fullName.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "requests") {
        getIncomingFriendRequests();
      }
      // Always fetch outgoing requests to show correct button states
      getOutgoingFriendRequests();
    }
  }, [isOpen, activeTab]);

  const isContactAdded = (userId) => {
    return contacts.some((contact) => contact._id === userId);
  };

  const hasPendingOutgoingRequest = (userId) => {
    return outgoingFriendRequests.some((request) => request._id === userId);
  };

  const hasPendingIncomingRequest = (userId) => {
    return incomingFriendRequests.some((request) => request._id === userId);
  };

  // Add cleanup when modal closes
  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="tabs tabs-boxed mb-4">
          <a
            className={`tab ${activeTab === "search" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            Search Users
          </a>
          <a
            className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Friend Requests
            {incomingFriendRequests.length > 0 && (
              <span className="ml-2 badge badge-primary badge-sm">
                {incomingFriendRequests.length}
              </span>
            )}
          </a>
        </div>

        {activeTab === "search" ? (
          <>
            <div className="flex items-center gap-2 border-b border-base-300 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name..."
                  className="input input-bordered w-full pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={
                            user.blockedUsers?.includes(authUser._id)
                              ? "/avatar.png"
                              : user.profilePic || "/avatar.png"
                          }
                          alt={user.fullName}
                          className="size-12 rounded-full object-cover"
                        />
                        {onlineUsers.includes(user._id) &&
                          !user.blockedUsers?.includes(authUser._id) && (
                            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                          )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="text-sm text-zinc-400">
                          {user.blockedUsers?.includes(authUser._id)
                            ? "Offline"
                            : onlineUsers.includes(user._id)
                            ? "Online"
                            : "Offline"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isContactAdded(user._id) ? (
                          <CheckCircle className="size-5 text-green-500" />
                        ) : hasPendingOutgoingRequest(user._id) ? (
                          <span className="text-sm text-zinc-400">
                            Request Sent
                          </span>
                        ) : hasPendingIncomingRequest(user._id) ? (
                          <>
                            <button
                              onClick={() => acceptFriendRequest(user._id)}
                              className="btn btn-sm btn-success"
                            >
                              <UserCheck className="size-4" />
                            </button>
                            <button
                              onClick={() => rejectFriendRequest(user._id)}
                              className="btn btn-sm btn-error"
                            >
                              <UserX className="size-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(user._id)}
                            disabled={isSendingFriendRequest}
                            className="btn btn-sm btn-primary"
                          >
                            {isSendingFriendRequest ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <UserPlus className="size-4" />
                            )}
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-zinc-400">No users found</p>
              ) : (
                <p className="text-center text-zinc-400">
                  Start typing to search for users
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {isLoadingFriendRequests ? (
              <div className="flex justify-center">
                <Loader2 className="size-8 animate-spin" />
              </div>
            ) : incomingFriendRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {incomingFriendRequests.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-base-300"
                  >
                    <div className="shrink-0">
                      {" "}
                      {/* Add shrink-0 to prevent image from shrinking */}
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {" "}
                      {/* Add min-w-0 to allow text truncation */}
                      <p className="font-medium truncate">{user.fullName}</p>
                      <p className="text-sm text-zinc-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {" "}
                      {/* Add shrink-0 to prevent buttons from shrinking */}
                      <button
                        onClick={() => acceptFriendRequest(user._id)}
                        className="btn btn-sm btn-success"
                      >
                        <UserCheck className="size-4" />
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(user._id)}
                        className="btn btn-sm btn-error"
                      >
                        <UserX className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400">
                No pending friend requests
              </p>
            )}
          </div>
        )}

        <div className="modal-action">
          <button onClick={handleClose} className="btn">
            Close
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop bg-base-200 opacity-50"
        onClick={handleClose}
      />
    </div>
  );
};

export default SearchUsersModal;
