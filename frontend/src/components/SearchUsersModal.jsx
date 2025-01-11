import { useState, useEffect } from "react";
import { Loader2, Search, UserPlus, CheckCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useDebounce from "../hooks/useDebounce";

const SearchUsersModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { getUsers, contacts, addContact, addingContact } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

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

  const isContactAdded = (userId) => {
    return contacts.some((contact) => contact._id === userId);
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

                  {isContactAdded(user._id) ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : (
                    <button
                      onClick={() => addContact(user._id)}
                      disabled={addingContact}
                      className="btn btn-sm btn-primary"
                    >
                      {addingContact ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserPlus className="size-4" />
                      )}
                      Add
                    </button>
                  )}
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
