import { Button } from "@/components/shacdn/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-zinc-950 transition-colors duration-300">
      <h1 className="text-6xl font-bold text-amber-900 dark:text-amber-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-300 mb-2">
        Sayfa Bulunamadi
      </h2>
      <p className="text-amber-700 dark:text-amber-400 mb-6">
        Aradiginiz sayfa mevcut degil veya kaldirilmis olabilir.
      </p>
      <Button onClick={() => navigate("/")}>Ana Sayfaya Don</Button>
    </div>
  );
};

export default NotFound;
