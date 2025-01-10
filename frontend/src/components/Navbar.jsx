import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  return (
    <header className="bg-base-100/80 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all group"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-primary">ChatApp</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline text-primary">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link 
                  to={"/profile"} 
                  className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 transition-colors"
                >
                  <User className="size-5 text-primary" />
                  <span className="hidden sm:inline text-primary">Profile</span>
                </Link>

                <button 
                  className="btn btn-sm btn-ghost gap-2 hover:bg-error/10 transition-colors" 
                  onClick={logout}
                >
                  <LogOut className="size-5 text-error" />
                  <span className="hidden sm:inline text-error">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
