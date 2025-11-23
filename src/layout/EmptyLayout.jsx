import React from "react";
import { Outlet } from "react-router-dom";

const EmptyLayout = () => {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-slate-700">
      <Outlet />
    </div>
  );
};

export default EmptyLayout;
