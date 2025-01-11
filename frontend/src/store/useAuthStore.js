import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    addingContact: false,
    isVerifyingEmail: false,
    isSendingResetEmail: false,
    isResettingPassword: false,
    blockedUsers: [],
    isLoadingBlockedUsers: false,

    verifyEmail: async (token) => {
        set({ isVerifyingEmail: true });
        try {
            const response = await axiosInstance.get(`/auth/verify/${token}`);
            // Remove this toast since we'll use the response message in VerifyEmailPage
            return response.data;
        } finally {
            set({ isVerifyingEmail: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isSendingResetEmail: true });
        try {
            await axiosInstance.post("/auth/forgot-password", { email });
            toast.success("Password reset email sent");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset email");
            return false;
        } finally {
            set({ isSendingResetEmail: false });
        }
    },

    resetPassword: async (token, password) => {
        set({ isResettingPassword: true });
        try {
            await axiosInstance.post(`/auth/reset-password/${token}`, { password });
            toast.success("Password reset successful");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed");
            return false;
        } finally {
            set({ isResettingPassword: false });
        }
    },

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });
            get().connectSocket() //call connectSocket function (get must be used to retrieve zustand state)

        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            await axiosInstance.post("/auth/signup", data)
            toast.success("Account created successfully. Please check your email to verify your account.")
            return true
        } catch (error) {
            toast.error(error.response.data.message)
            return false
        } finally {
            set({ isSigningUp: false })
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Logged in successfully")
            get().connectSocket()
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error?.response?.data?.message || "Error logging in");
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")
            get().disconnectSocket() //call diconnectSocket function
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstance.put("/auth/update-profile", data)
            set({ authUser: res.data })
            toast.success("Profile picture updated successfully")
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    blockUser: async (userId) => {
        try {
            await axiosInstance.post(`/auth/block/${userId}`);
            const currentUser = get().authUser;

            // Update authUser state
            set({
                authUser: {
                    ...currentUser,
                    blockedUsers: [...(currentUser.blockedUsers || []), userId]
                }
            });

            // Also update blockedUsers list if it's loaded
            const { blockedUsers } = get();
            if (blockedUsers.length > 0) {
                const blockedUserData = await axiosInstance.get(`/auth/user/${userId}`);
                set({
                    blockedUsers: [...blockedUsers, blockedUserData.data]
                });
            }

            // Emit socket event
            get().socket?.emit("userBlocked", {
                blockedUserId: userId,
                blockerId: currentUser._id
            });

            toast.success("User blocked successfully");
        } catch (error) {
            toast.error("Failed to block user");
            console.error(error);
        }
    },

    unblockUser: async (userId) => {
        try {
            await axiosInstance.post(`/auth/unblock/${userId}`);
            const currentUser = get().authUser;
            // Update both authUser.blockedUsers and blockedUsers state
            set({
                authUser: {
                    ...currentUser,
                    blockedUsers: currentUser.blockedUsers.filter(id => id !== userId)
                },
                blockedUsers: get().blockedUsers.filter(user => user._id !== userId)
            });
            // Emit socket event
            get().socket?.emit("userUnblocked", {
                unblockedUserId: userId,
                unblockerId: currentUser._id
            });
            toast.success("User unblocked successfully");
        } catch (error) {
            toast.error("Failed to unblock user", error);
        }
    },

    getBlockedUsers: async () => {
        set({ isLoadingBlockedUsers: true });
        try {
            const res = await axiosInstance.get("/auth/blocked-users");
            set({ blockedUsers: res.data });
        } catch (error) {
            toast.error("Failed to fetch blocked users", error);
        } finally {
            set({ isLoadingBlockedUsers: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get()
        {/* dont connect to socket if user is not authentified or is already authentified*/ }
        if (!authUser || get().socket?.connected) return

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id, //options to pass userId with socket
            },
        })
        socket.connect()

        set({ socket: socket })

        // listening for events on socket (automatically set onlineUsers value when event happens)
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })

        socket.on("userBlockedUpdate", ({ blockerId }) => {
            const currentUser = get().authUser;
            if (!currentUser) return;

            set({
                authUser: {
                    ...currentUser,
                    blockedByUsers: [...(currentUser.blockedByUsers || []), blockerId]
                }
            });

            // Refresh blocked users list if it's loaded
            if (get().blockedUsers.length > 0) {
                get().getBlockedUsers();
            }
        });

        socket.on("userUnblockedUpdate", ({ unblockerId }) => {
            const currentUser = get().authUser;
            if (!currentUser) return;

            set({
                authUser: {
                    ...currentUser,
                    blockedByUsers: (currentUser.blockedByUsers || []).filter(id => id !== unblockerId)
                }
            });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect(); {/*only disconnect if u are already connected*/ }
    },

}));
