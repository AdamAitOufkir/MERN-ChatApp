const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => {
        // Determine the background color based on the index
        const bg = idx % 2 === 0 ? "bg-base-200" : "bg-primary";

        return (
          <div
            key={idx}
            className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full">
                <div className={`skeleton w-full h-full rounded-full ${bg}`} />
              </div>
            </div>

            <div className="chat-header mb-1">
              <div className={`skeleton h-4 w-16 rounded-2xl ${bg}`} />
            </div>

            <div className="chat-bubble bg-transparent p-0">
              <div className={`skeleton h-16 w-[200px] rounded-2xl ${bg}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
