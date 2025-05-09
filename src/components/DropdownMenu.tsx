import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { CaretDownFill, CaretUpFill, PersonCircle } from "../icons";

interface DropdownMenuProps {
  userName: string;
  onLogout: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ userName, onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="px-1 py-2 text-sm font-medium text-gray-700 text-white rounded shadow-sm flex items-center space-x-2"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="flex items-center space-x-2">
          <PersonCircle />
          <span>{userName}</span>
          {isDropdownOpen ? <CaretUpFill size={12} /> : <CaretDownFill size={12} />}
        </span></button>
      {isDropdownOpen && (
        <div className="dropdownmenu absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
          <button
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => navigate("/system")}
          >
            System
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => navigate("/subscriptions")}
          >
            Subscriptions
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
