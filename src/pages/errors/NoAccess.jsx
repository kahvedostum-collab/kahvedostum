import { Button } from "@/components/shacdn/button";
import { useNavigate } from "react-router-dom";

const NoAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-zinc-950 transition-colors duration-300">
      <h1 className="text-6xl font-bold text-amber-900 dark:text-amber-400 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-300 mb-2">
        Erisim Engellendi
      </h2>
      <p className="text-amber-700 dark:text-amber-400 mb-6">
        Bu sayfaya erisim izniniz bulunmuyor.
      </p>
      <Button onClick={() => navigate("/")}>Ana Sayfaya Don</Button>
    </div>
  );
};

export default NoAccess;
