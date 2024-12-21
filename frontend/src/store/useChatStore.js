import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts")
            set({ contacts: res.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isContactsLoading: false })
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