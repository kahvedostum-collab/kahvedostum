import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const EmptyMessagesState = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-[500px] bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg">
      <div className="h-20 w-20 rounded-full bg-linear-to-r from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
        <MessageSquare className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
        {t("friends.sections.messagesTitle")}
      </h3>
      <p className="text-amber-600 dark:text-amber-400 text-center max-w-xs">
        {t("friends.sections.messagesDesc")}
      </p>
    </div>
  );
};

export default EmptyMessagesState;
