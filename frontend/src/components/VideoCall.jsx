import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { useSound } from "../hooks/useSound";

const VideoCall = () => {
  const { authUser } = useAuthStore();
  const { currentCall, endCall } = useChatStore();
  const { playSound } = useSound();
  const socket = useAuthStore((state) => state.socket);

  useEffect(() => {
    if (!currentCall || !socket) return;

    // Listen for other user's actions
    socket.on("userJoinedCall", () => {
      playSound("join");
    });

    socket.on("userLeftCall", () => {
      playSound("leave");
    });

    // Notify other user when joining
    socket.emit("userJoinedCall", {
      to: currentCall.isInitiator
        ? currentCall.roomId.split("-")[0]
        : currentCall.from,
    });

    return () => {
      // Notify other user when leaving
      socket.emit("userLeftCall", {
        to: currentCall.isInitiator
          ? currentCall.roomId.split("-")[0]
          : currentCall.from,
      });
      socket.off("userJoinedCall");
      socket.off("userLeftCall");
    };
  }, [currentCall]);

  useEffect(() => {
    if (!currentCall) return;

    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        toast.error(
          "Failed to access media devices. Please check permissions."
        );
        console.error("Permission error:", err);
      }
    };

    const initCall = async (element) => {
      await requestPermissions();

      const appID = 952884008;
      const serverSecret = "291cc54fdf506f6f1e25d0b5c9625e7b";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        currentCall.roomId,
        authUser._id,
        authUser.fullName
      );

      const zc = ZegoUIKitPrebuilt.create(kitToken);

      zc.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 2,
        layout: "Auto",
        showLayoutButton: true,
        onLeaveRoom: () => endCall(),
        turnOnCameraWhenJoining: currentCall.isVideoCall,
        turnOnMicrophoneWhenJoining: true,
        showPreJoinView: false,
        preJoinViewConfig: {
          title: currentCall.isVideoCall ? "Video Call" : "Voice Call",
        },
      });
    };

    const element = document.getElementById("zego-container");
    if (element) initCall(element);
  }, [currentCall, authUser, endCall]);

  if (!currentCall) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div id="zego-container" className="h-full" />
    </div>
  );
};

export default VideoCall;
