import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { UserPlus, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const {
    getContacts,
    contacts,
    isContactsLoading,
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    addContact,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await getContacts();
      await getUsers();
      subscribeToMessages();
    };

    initialize();

    return () => {
      unsubscribeFromMessages();
    };
  }, []); // Remove the dependencies since we're managing updates through state

  // Move the filtering and sorting logic into a useMemo to optimize performance
  const sortedFilteredContacts = useMemo(() => {
    const filtered = showOnlineOnly
      ? contacts.filter((contact) => onlineUsers.includes(contact._id))
      : contacts;

    return filtered.sort((a, b) => {
      const aLastMessageTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bLastMessageTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bLastMessageTime - aLastMessageTime;
    });
  }, [contacts, showOnlineOnly, onlineUsers]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    const results = users.filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setIsSearching(false);
  };

  // Add helper function to count unseen messages
  const getUnseenCount = (contact) => {
    if (!contact.messages || !contact.messages.length) return 0;

    const { authUser } = useAuthStore.getState();
    return contact.messages.filter(
      (msg) =>
        msg.senderId === contact._id &&
        msg.receiverId === authUser._id &&
        !msg.seen
    ).length;
  };

  if (isContactsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between place-self-center lg:gap-4 gap-0">
          <div className="flex items-center gap-2">
            <Users className="size-6 hidden lg:block" />
            <button
              className="lg:hidden btn "
              onClick={() => document.getElementById("my_modal_2").showModal()}
            >
              <UserPlus className="size-6" />
            </button>
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn hidden lg:flex"
              onClick={() => document.getElementById("my_modal_2").showModal()}
            >
              <UserPlus className="size-6" />
            </button>
          </div>
        </div>

        <dialog id="my_modal_2" className="modal">
          <div className="modal-box">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="input input-bordered w-full"
              />
              <button type="submit" className="btn">
                Search
              </button>
            </form>
            {!isSearching && (
              <ul>
                {searchResults
                  .sort((a, b) => {
                    const aInContacts = contacts.some(
                      (contact) => contact._id === a._id
                    );
                    const bInContacts = contacts.some(
                      (contact) => contact._id === b._id
                    );
                    if (aInContacts && !bInContacts) return -1;
                    if (!aInContacts && bInContacts) return 1;
                    return a.fullName.localeCompare(b.fullName);
                  })
                  .map((user) => (
                    <li
                      key={user._id}
                      className="flex justify-between items-center mb-2"
                    >
                      <div className="relative flex mx-auto lg:mx-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.name}
                          className="size-12 object-cover rounded-full"
                        />
                        {onlineUsers.includes(user._id) && (
                          <span
                            className="absolute bottom-0 right-0 size-3 bg-green-500 
                rounded-full ring-2 ring-zinc-900"
                          />
                        )}
                        <span className="ml-4 content-center">
                          {user.fullName}
                        </span>
                      </div>
                      {!contacts.some(
                        (contact) => contact._id === user._id
                      ) && (
                        <button
                          onClick={() => addContact(user._id)}
                          className="btn btn-sm"
                        >
                          Add to Contacts
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        {/*filter users*/}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {sortedFilteredContacts.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {/* Online status - bottom right */}
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
              {/* Unseen message count - mobile only (top right) */}
              <div className="lg:hidden">
                {getUnseenCount(user) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-xs font-medium min-w-[20px] h-5 rounded-full flex items-center justify-center ring-2 ring-base-100">
                    {getUnseenCount(user)}
                  </span>
                )}
              </div>
            </div>

            {/* User info and unseen count - desktop only */}
            <div className="hidden lg:flex flex-1 items-center">
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
              {/* Unseen count for desktop */}
              {getUnseenCount(user) > 0 && (
                <div className="min-w-fit">
                  <span className="bg-primary text-primary-content text-xs font-medium px-2.5 py-1 rounded-full">
                    {getUnseenCount(user)}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}

        {sortedFilteredContacts.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
