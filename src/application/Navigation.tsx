import { useAuth } from "../auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CaretDownFill, CaretUpFill, PersonCircle } from "../icons";
import DropdownMenu from "../components/DropdownMenu";

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="relative w-full flex items-center justify-between px-4 py-2 bg-primary text-white shadow">
      <div className="text-xl font-bold" onClick={() => navigate("/home")}>
        Template
      </div>
      <div>
        {user?.name ? (
          <DropdownMenu userName={user.name} onLogout={handleLogout} />
        ) : (
          <button
            className="px-1 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;