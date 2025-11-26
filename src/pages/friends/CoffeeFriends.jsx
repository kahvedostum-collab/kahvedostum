import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  UserPlus,
  Coffee,
  Users,
  Inbox,
  MessageSquare,
  Plus,
} from 'lucide-react';
import DefaultLayout from '@/layout/DefaultLayout';
import { Button } from '@/components/shacdn/button';
import { Badge } from '@/components/shacdn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shacdn/tabs';
import { Separator } from '@/components/shacdn/separator';
import FriendsList from '@/components/friends/FriendsList';
import IncomingRequests from '@/components/friends/IncomingRequests';
import OutgoingRequests from '@/components/friends/OutgoingRequests';
import ConversationsList from '@/components/friends/ConversationsList';
import ChatView from '@/components/friends/ChatView';
import AddFriendDialog from '@/components/friends/AddFriendDialog';
import { fetchFriends } from '@/endpoints/friends/FriendsAPI';
import {
  fetchIncomingRequests,
  fetchOutgoingRequests,
} from '@/endpoints/friends/FriendRequestsAPI';
import { fetchConversations } from '@/endpoints/friends/MessagesAPI';

const CoffeeFriends = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
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
      setActiveTab('messages');
    } else {
      setSelectedConversation({
        id: null,
        otherUser: friend,
      });
      setActiveTab('messages');
    }
  };

  const incomingCount = friends.incomingRequests?.length || 0;
  const outgoingCount = friends.outgoingRequests?.length || 0;
  const friendsCount = friends.list?.length || 0;
  const unreadMessagesCount =
    messages.conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;

  // Mobile'da chat açıkken full screen göster
  if (selectedConversation && activeTab === 'messages') {
    return (
      <DefaultLayout>
        <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 flex flex-col lg:hidden transition-colors duration-300">
          <ChatView
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            fullScreen
          />
        </div>
        {/* Desktop view */}
        <div className="hidden lg:block min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 transition-colors duration-300">
          <DesktopLayout
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
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-950 transition-colors duration-300">
        <DesktopLayout
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

      {/* Floating Action Button - Mobile */}
      <Button
        onClick={() => setShowAddFriend(true)}
        className="lg:hidden fixed bottom-6 right-6 h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} />
    </DefaultLayout>
  );
};

// Desktop/Tablet Layout Component
const DesktopLayout = ({
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
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const updateIndicator = () => {
      if (!tabsRef.current || !indicatorRef.current) return;
      const activeTabEl = tabsRef.current.querySelector('[data-state="active"]');
      if (activeTabEl) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTabEl.getBoundingClientRect();

        gsap.to(indicatorRef.current, {
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          duration: 0.4,
          ease: 'power3.out',
        });
      }
    };

    // İlk render'da hemen güncelle (animasyonsuz)
    const initIndicator = () => {
      if (!tabsRef.current || !indicatorRef.current) return;
      const activeTabEl = tabsRef.current.querySelector('[data-state="active"]');
      if (activeTabEl) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTabEl.getBoundingClientRect();

        gsap.set(indicatorRef.current, {
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
        });
      }
    };

    // requestAnimationFrame ile DOM'un hazır olmasını bekle
    const frameId = requestAnimationFrame(() => {
      initIndicator();
      // Tab değişince animasyonlu güncelle
      if (activeTab) {
        requestAnimationFrame(updateIndicator);
      }
    });

    const handleResize = () => requestAnimationFrame(initIndicator);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Banner - Dashboard ile uyumlu */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {t('friends.page.title')}
              </h1>
              <p className="text-amber-100 mt-1">
                {t('friends.page.friendCount', { count: friendsCount })} • {unreadMessagesCount > 0 ? t('friends.page.unreadMessages', { count: unreadMessagesCount }) : t('friends.page.allMessagesRead')}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddFriend(true)}
            className="hidden lg:flex bg-white/20 hover:bg-white/30 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('friends.page.addFriend')}
          </Button>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          ref={tabsRef}
          className="relative grid w-full grid-cols-3 bg-white dark:bg-zinc-900 p-1 rounded-xl h-auto border-2 border-amber-200 dark:border-amber-900/50 shadow-sm"
        >
          {/* Animated Indicator - GSAP controlled */}
          <div
            ref={indicatorRef}
            className="absolute bottom-1 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          />
          <TabsTrigger
            value="friends"
            className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-amber-600 dark:text-amber-500 font-medium hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:font-semibold"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('friends.tabs.friends')}</span>
            <Badge
              variant="secondary"
              className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold"
            >
              {friendsCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-amber-600 dark:text-amber-500 font-medium hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:font-semibold"
          >
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">{t('friends.tabs.requests')}</span>
            {incomingCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                {incomingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 text-amber-600 dark:text-amber-500 font-medium hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:font-semibold"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t('friends.tabs.messages')}</span>
            {unreadMessagesCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                {unreadMessagesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="mt-6 animate-in fade-in-50 duration-300">
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
        <TabsContent value="requests" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
          {/* Gelen İstekler */}
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Inbox className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  {t('friends.sections.incomingTitle')}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {t('friends.sections.incomingDesc')}
                </p>
              </div>
              {incomingCount > 0 && (
                <Badge className="bg-green-500 text-white ml-auto">{incomingCount}</Badge>
              )}
            </div>
            <IncomingRequests
              requests={friends.incomingRequests}
              isLoading={friends.isLoading}
            />
          </div>

          {/* Gönderilen İstekler */}
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  {t('friends.sections.outgoingTitle')}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {t('friends.sections.outgoingDesc')}
                </p>
              </div>
              <Badge variant="secondary" className="bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 ml-auto">
                {outgoingCount}
              </Badge>
            </div>
            <OutgoingRequests
              requests={friends.outgoingRequests}
              isLoading={friends.isLoading}
            />
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[calc(100vh-300px)] min-h-[500px]">
            <div className={`lg:col-span-2 ${selectedConversation ? 'hidden lg:block' : ''}`}>
              <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg h-full">
                <ConversationsList
                  conversations={messages.conversations}
                  isLoading={messages.isLoading}
                  onSelect={setSelectedConversation}
                  activeId={selectedConversation?.id}
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              {selectedConversation ? (
                <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg overflow-hidden">
                  <ChatView
                    conversation={selectedConversation}
                    onBack={() => setSelectedConversation(null)}
                  />
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-[500px] bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    {t('friends.sections.messagesTitle')}
                  </h3>
                  <p className="text-amber-600 dark:text-amber-400 text-center max-w-xs">
                    {t('friends.sections.messagesDesc')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoffeeFriends;
