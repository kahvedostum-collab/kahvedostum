import React from "react";
import Header from "@/components/layout/Header";

const DefaultLayout = ({ children }) => {
  return (
    <div className="min-h-screen min-w-full flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DefaultLayout;
