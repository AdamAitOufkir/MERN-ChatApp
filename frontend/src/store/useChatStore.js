import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import Swal from "sweetalert2";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
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

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({ messages: [...messages, res.data] }) // keep all messages , and add new message at the end
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    // deleteMessage: async (messageId) => {
    //     const { messages } = get();
    //     try {
    //         await axiosInstance.delete(`/messages/${messageId}`);
    //         set({ messages: messages.filter((msg) => msg._id !== messageId) });
    //         toast.success("Message deleted successfully");
    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Failed to delete message");
    //     }
    // },
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

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return

        const socket = useAuthStore.getState().socket //get socket state from authstore
        //on newMessages event , do ...
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
            if (!isMessageSentFromSelectedUser) return;

            set({ messages: [...get().messages, newMessage] })
        })
    },


    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket //get socket state from authstore
        socket.off("newMessage")
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

}))