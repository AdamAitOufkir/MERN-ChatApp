import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import Swal from "sweetalert2";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    contacts: [],
    selectedUser: null,
    isUsersLoading: false,
    isContactsLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users")
            set({ users: res.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getContacts: async () => {
        set({ isContactsLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            const contacts = res.data;

            // Fetch the last message for each contact
            for (let contact of contacts) {
                const messagesRes = await axiosInstance.get(`/messages/${contact._id}`);
                contact.lastMessage = messagesRes.data[messagesRes.data.length - 1];
            }

            set({ contacts });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isContactsLoading: false });
        }
    },

    addContact: async (contactId) => {
        set({ addingContact: true })
        try {
            const { contacts } = get()

            const res = await axiosInstance.post(`/auth/add-contact/${contactId}`)
            set({ contacts: [...contacts, res.data] })
            toast.success("Contact Added Successfully")
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ addingContact: false })
        }
    },


    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })

            // Update last message for the selected user
            const { contacts } = get();
            const updatedContacts = contacts.map(contact => {
                if (contact._id === userId) {
                    contact.lastMessage = res.data[res.data.length - 1];
                }
                return contact;
            });
            set({ contacts: updatedContacts });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages, contacts } = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({
                messages: [...messages, res.data],
                contacts: contacts.map(contact => {
                    if (contact._id === selectedUser._id) {
                        return { ...contact, lastMessage: res.data };
                    }
                    return contact;
                })
            });
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    deleteMessage: async (messageId) => {
        const { messages } = get();
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone!",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
                customClass: {
                    popup: 'bg-base-200 rounded-3xl text-base-content', // Use DaisyUI utility classes
                },
            });

            if (result.isConfirmed) {
                await axiosInstance.delete(`/messages/${messageId}`);
                set({ messages: messages.filter((msg) => msg._id !== messageId) });
                Swal.fire({
                    title: "Deleted!",
                    text: "The message has been deleted.",
                    customClass: {
                        popup: 'bg-base-200 rounded-3xl text-base-content', // Use DaisyUI utility classes
                    },
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to delete the message.",
                icon: "error",
            });
        }
    },

    updateMessagesSeen: (receiverId) => {
        const { messages } = get();
        const updatedMessages = messages.map(msg => {
            if (msg.receiverId === receiverId) {
                return { ...msg, seen: true };
            }
            return msg;
        });
        set({ messages: updatedMessages });
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket?.connected) return;

        socket.off("newMessage");
        socket.off("messagesSeen");

        socket.on("newMessage", (newMessage) => {
            const { selectedUser, messages, contacts } = get();
            const authUser = useAuthStore.getState().authUser;

            // Only mark as seen if we're the receiver and in the active chat with sender
            if (selectedUser &&
                newMessage.senderId === selectedUser._id &&
                newMessage.receiverId === authUser._id) {
                socket.emit("markMessagesAsSeen", {
                    senderId: newMessage.senderId,
                    receiverId: newMessage.receiverId
                });
                newMessage.seen = true;
            }

            // Update messages if we're in the relevant chat
            if (selectedUser &&
                (newMessage.senderId === selectedUser._id ||
                    newMessage.receiverId === selectedUser._id)) {
                set({ messages: [...messages, newMessage] });
            }

            // Update contacts list with new last message
            const updatedContacts = contacts.map(contact => {
                if (contact._id === newMessage.senderId ||
                    contact._id === newMessage.receiverId) {
                    return { ...contact, lastMessage: newMessage };
                }
                return contact;
            });
            set({ contacts: updatedContacts });
        });

        socket.on("messagesSeen", ({ receiverId }) => {
            const { messages } = get();
            const updatedMessages = messages.map(msg => {
                if (msg.receiverId === receiverId) {
                    return { ...msg, seen: true };
                }
                return msg;
            });
            set({ messages: updatedMessages });
        });

        // Handle reconnection
        socket.on("connect", () => {
            console.log("Socket reconnected, resubscribing to messages");
            get().subscribeToMessages();
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket?.connected) {
            socket.off("newMessage");
            socket.off("connect");
            socket.off("messagesSeen");
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

}))