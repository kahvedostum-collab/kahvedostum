import PropTypes from "prop-types";
import ConversationsList from "./ConversationsList";
import ChatView from "./ChatView";
import EmptyMessagesState from "./EmptyMessagesState";

const MessagesLayout = ({
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
  onBack,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[calc(100vh-300px)] min-h-[500px]">
      <div
        className={`lg:col-span-2 ${selectedConversation ? "hidden lg:block" : ""}`}
      >
        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg h-full">
          <ConversationsList
            conversations={conversations}
            isLoading={isLoading}
            onSelect={onSelectConversation}
            activeId={selectedConversation?.id}
          />
        </div>
      </div>
      <div className="lg:col-span-3">
        {selectedConversation ? (
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg overflow-hidden">
            <ChatView conversation={selectedConversation} onBack={onBack} />
          </div>
        ) : (
          <EmptyMessagesState />
        )}
      </div>
    </div>
  );
};

MessagesLayout.propTypes = {
  conversations: PropTypes.array,
  isLoading: PropTypes.bool,
  selectedConversation: PropTypes.object,
  onSelectConversation: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

MessagesLayout.defaultProps = {
  conversations: [],
  isLoading: false,
  selectedConversation: null,
};

export default MessagesLayout;
