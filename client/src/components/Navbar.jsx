import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { LifeBuoy, LogOut, UserCircle } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-[2px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Support<span className="text-blue-600">Desk</span>
              </span>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Ticket Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-3 pr-3 border-r border-slate-200">
                <div className="w-7 h-7 rounded-[2px] bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-xs">
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <UserCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-[2px] border border-slate-200 transition-colors duration-150 focus:outline-none"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
