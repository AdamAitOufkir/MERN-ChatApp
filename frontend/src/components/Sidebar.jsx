import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { UserPlus, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import SearchUsersModal from "./SearchUsersModal";

const Sidebar = () => {
  const {
    getContacts,
    contacts,
    isContactsLoading,
    getUsers,
    selectedUser,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
        <div className="flex items-center justify-between place-self-center lg:gap-4 md:gap-4 gap-0">
          <div className="flex items-center gap-2">
            <Users className="size-6 hidden lg:block" />
            <button
              className="lg:hidden btn"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <UserPlus className="size-6" />
            </button>
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn hidden lg:flex"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <UserPlus className="size-6" />
            </button>
          </div>
        </div>

        <SearchUsersModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />

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
