import React, { useState } from "react";
import { accessElf } from "./utils/accessElf";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";

function ChangePassword() {
  accessElf.track("ChangePassword");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const navigate = useNavigate();
  const { user, changePassword } = useAuth(); 


  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    const urlHash = new URLSearchParams(window.location.search).get("hash");
    if (urlHash) {
      setHash(urlHash);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      console.error("Passwords do not match");
      return;
    }
    try {
      await changePassword(user.id, currentPassword, newPassword, confirmNewPassword, hash);
      console.log("Change password request sent");
    } catch (error) {
      console.error("Change password failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-4 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/")}
        >
          X
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Change Password
        </h2>
        <form className="space-y-4" onSubmit={handleChangePassword}>
          {!hash && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;