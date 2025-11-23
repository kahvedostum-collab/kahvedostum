import React from "react";

import Home from "@/pages/Home";
import Login from "@/pages/authentication/Login";
import SignUp from "@/pages/authentication/SignUp";
import Dashboard from "@/pages/dashboard/Dashboard";
import About from "@/pages/others/About";
import { Route, Routes } from "react-router";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default App;
