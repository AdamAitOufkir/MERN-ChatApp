import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 md:pt-20 sm:pt-20 lg:pt-20 sm:px-4 md:px-4 lg:px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full lg:h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] h-[calc(100vh-4rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
