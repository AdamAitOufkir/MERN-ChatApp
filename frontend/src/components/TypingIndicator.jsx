const TypingIndicator = ({ selectedUser }) => {
  return (
    <div className="chat chat-start mb-4">
      <div className="chat-image avatar">
        <div className="w-8 h-8 rounded-full border">
          <img 
            src={selectedUser?.profilePic || "/avatar.png"} 
            alt="typing indicator" 
            className="opacity-50"
          />
        </div>
      </div>
      <div className="chat-bubble min-h-8 flex items-center bg-base-200 py-2 px-4">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-typing1"></span>
          <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-typing2"></span>
          <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-typing3"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
