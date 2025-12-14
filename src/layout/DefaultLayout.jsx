import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "@/components/layout/Header";
import { fetchMe } from "@/endpoints/layout/MeAPI";

const DefaultLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { data: userData } = useSelector(
    (state) => state.kahvedostumslice?.userDetails || {}
  );

  // Kullanıcı verisi yoksa sadece 1 kere çağır
  useEffect(() => {
    if (!userData) {
      dispatch(fetchMe());
    }
  }, [dispatch, userData]);

  return (
    <div className="min-h-screen min-w-full flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DefaultLayout;
