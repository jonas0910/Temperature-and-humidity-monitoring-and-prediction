

import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../core/components/sidebar/sidebar";
import supabase from "../core/config/supabase-client";

const PrivateRoute = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(!!session);
      setLoading(false);
    };

    getSession();
  }, []);

  return loading ? (
    <div>Cargando...</div>
  ) : authenticated ? (
    <div className="flex">
      <Sidebar />
      <main className="w-full h-full p-4 bg-background dark:bg-background-dark">
        <Outlet />
      </main>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
