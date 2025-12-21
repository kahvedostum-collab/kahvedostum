import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Inbox, UserPlus } from "lucide-react";
import { TabsContent } from "@/components/shacdn/tabs";
import DefaultLayout from "@/layout/DefaultLayout";
import FriendsList from "@/components/friends/FriendsList";
import IncomingRequests from "@/components/friends/IncomingRequests";
import OutgoingRequests from "@/components/friends/OutgoingRequests";
import ChatView from "@/components/friends/ChatView";
import AddFriendDialog from "@/components/friends/AddFriendDialog";
import FriendsPageHeader from "@/components/friends/FriendsPageHeader";
import FriendsTabsNavigation from "@/components/friends/FriendsTabsNavigation";
import RequestSection from "@/components/friends/RequestSection";
import MessagesLayout from "@/components/friends/MessagesLayout";
import FloatingAddButton from "@/components/friends/FloatingAddButton";
import { fetchFriends } from "@/endpoints/friends/FriendsAPI";
import {
  fetchIncomingRequests,
  fetchOutgoingRequests,
} from "@/endpoints/friends/FriendRequestsAPI";
import { fetchConversations } from "@/endpoints/friends/MessagesAPI";

const CoffeeFriends = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { friends, messages } = useSelector((state) => state.kahvedostumslice);

  useEffect(() => {
    dispatch(fetchFriends());
    dispatch(fetchIncomingRequests());
    dispatch(fetchOutgoingRequests());
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleMessageClick = (friend) => {
    const existingConversation = messages.conversations.find(
      (c) =>
        c.otherUser?.id === friend.userId ||
        c.participant?.id === friend.userId ||
        c.otherUser?.id === friend.id ||
        c.participant?.id === friend.id
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
      setActiveTab("messages");
    } else {
      setSelectedConversation({
        id: null,
        otherUser: friend,
      });
      setActiveTab("messages");
    }
  };

  const incomingCount = friends.incomingRequests?.length || 0;
  const outgoingCount = friends.outgoingRequests?.length || 0;
  const friendsCount = friends.list?.length || 0;
  const unreadMessagesCount =
    messages.conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) ||
    0;

  // Mobile'da chat açıkken full screen göster
  if (selectedConversation && activeTab === "messages") {
    return (
      <DefaultLayout>
        <div className="h-full min-h-0 w-full bg-linear-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 flex flex-col lg:hidden transition-colors duration-300 overflow-hidden">
          <ChatView
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            fullScreen
          />
        </div>
        {/* Desktop view */}
        <div className="hidden lg:block min-h-screen w-full bg-linear-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 transition-colors duration-300">
          <DesktopContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            friends={friends}
            messages={messages}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            handleMessageClick={handleMessageClick}
            setShowAddFriend={setShowAddFriend}
            navigate={navigate}
            incomingCount={incomingCount}
            outgoingCount={outgoingCount}
            friendsCount={friendsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
        </div>
        <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen w-full bg-linear-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 transition-colors duration-300">
        <DesktopContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          friends={friends}
          messages={messages}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          handleMessageClick={handleMessageClick}
          setShowAddFriend={setShowAddFriend}
          navigate={navigate}
          incomingCount={incomingCount}
          outgoingCount={outgoingCount}
          friendsCount={friendsCount}
          unreadMessagesCount={unreadMessagesCount}
        />
      </div>

      <FloatingAddButton onClick={() => setShowAddFriend(true)} />

      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} />
    </DefaultLayout>
  );
};

// Desktop/Tablet Layout Component
const DesktopContent = ({
  activeTab,
  setActiveTab,
  friends,
  messages,
  selectedConversation,
  setSelectedConversation,
  handleMessageClick,
  setShowAddFriend,
  navigate,
  incomingCount,
  outgoingCount,
  friendsCount,
  unreadMessagesCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <FriendsPageHeader
        onBack={() => navigate("/dashboard")}
        onAddFriend={() => setShowAddFriend(true)}
        friendsCount={friendsCount}
        unreadMessagesCount={unreadMessagesCount}
      />

      <FriendsTabsNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        friendsCount={friendsCount}
        incomingCount={incomingCount}
        unreadMessagesCount={unreadMessagesCount}
      >
        {/* Friends Tab */}
        <TabsContent
          value="friends"
          className="mt-6 animate-in fade-in-50 duration-300"
        >
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg p-4 sm:p-6">
            <FriendsList
              friends={friends.list}
              isLoading={friends.isLoading}
              onMessageClick={handleMessageClick}
              onAddFriend={() => setShowAddFriend(true)}
            />
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent
          value="requests"
          className="mt-6 space-y-6 animate-in fade-in-50 duration-300"
        >
          <RequestSection
            icon={<Inbox className="h-5 w-5 text-white" />}
            iconGradient="from-green-400 to-emerald-500"
            title={t("friends.sections.incomingTitle")}
            description={t("friends.sections.incomingDesc")}
            count={incomingCount}
            badgeClassName="bg-green-500 text-white"
          >
            <IncomingRequests
              requests={friends.incomingRequests}
              isLoading={friends.isLoading}
            />
          </RequestSection>

          <RequestSection
            icon={<UserPlus className="h-5 w-5 text-white" />}
            iconGradient="from-amber-400 to-orange-500"
            title={t("friends.sections.outgoingTitle")}
            description={t("friends.sections.outgoingDesc")}
            count={outgoingCount}
            badgeClassName="bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200"
          >
            <OutgoingRequests
              requests={friends.outgoingRequests}
              isLoading={friends.isLoading}
            />
          </RequestSection>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent
          value="messages"
          className="mt-6 animate-in fade-in-50 duration-300"
        >
          <MessagesLayout
            conversations={messages.conversations}
            isLoading={messages.isLoading}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        </TabsContent>
      </FriendsTabsNavigation>
    </div>
  );
};

export default CoffeeFriends;
