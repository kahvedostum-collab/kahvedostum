import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Search, UserPlus, Loader2, Users, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shacdn/dialog";
import { Input } from "@/components/shacdn/input";
import { Button } from "@/components/shacdn/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shacdn/avatar";
import { ScrollArea } from "@/components/shacdn/scroll-area";
import { sendFriendRequest } from "@/endpoints/friends/FriendRequestsAPI";
import axios from "@/services/axiosClient";
import { toast } from "react-toastify";

const AddFriendDialog = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await axios.get("/Users/search", {
        params: { query: searchQuery },
      });
      setSearchResults(response.data?.data || response.data || []);
    } catch (error) {
      toast.error(t('friends.addFriend.searchError'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSendRequest = async (user) => {
    setSendingTo(user.id);
    try {
      await dispatch(sendFriendRequest(user.id)).unwrap();
      toast.success(
        t('friends.addFriend.requestSentSuccess', { name: user.displayName || user.userName })
      );
      setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      toast.error(error?.error?.message || t('friends.addFriend.requestSentError'));
    } finally {
      setSendingTo(null);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 dark:border-zinc-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-amber-900 dark:text-amber-100">
                {t('friends.addFriend.title')}
              </DialogTitle>
              <DialogDescription className="text-amber-600 dark:text-amber-400">
                {t('friends.addFriend.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
            <Input
              ref={inputRef}
              placeholder={t('friends.addFriend.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 transition-colors"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[350px] mt-4">
          {isSearching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-zinc-800 rounded-xl animate-pulse"
                >
                  <div className="h-12 w-12 bg-amber-200 dark:bg-amber-900/50 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-amber-200 dark:bg-amber-900/50 rounded" />
                    <div className="h-3 w-20 bg-amber-200 dark:bg-amber-900/50 rounded" />
                  </div>
                  <div className="h-9 w-16 bg-amber-200 dark:bg-amber-900/50 rounded-md" />
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-amber-200 dark:border-amber-700">
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.displayName || user.userName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 font-bold">
                        {getInitials(user.displayName || user.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        {user.displayName || user.userName}
                      </p>
                      {user.userName && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          @{user.userName}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(user)}
                    disabled={sendingTo === user.id}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md"
                  >
                    {sendingTo === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        {t('friends.addFriend.addButton')}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : hasSearched && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-500 dark:text-amber-400" />
              </div>
              <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                {t('friends.empty.noSearchResults')}
              </h4>
              <p className="text-amber-600 dark:text-amber-400 text-sm max-w-xs">
                {t('friends.empty.noSearchResultsDesc')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                {t('friends.empty.searchPrompt')}
              </h4>
              <p className="text-amber-600 dark:text-amber-400 text-sm max-w-xs">
                {t('friends.empty.searchPromptDesc')}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
