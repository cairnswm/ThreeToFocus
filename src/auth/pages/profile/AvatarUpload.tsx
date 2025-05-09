import React, { useState } from "react";
import useFileLoader from "../../hooks/useFileLoader";
import { combineUrlAndPath } from "../../utils/combineUrlAndPath";
import { REACT_APP_FILES } from "../../../env";
import { User } from "../../../types/userTypes";

interface AvatarUploadProps {
  user?: User;
  onUploadSuccess?: (response: any) => Promise<void>;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (percent: number) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  user,
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const { fileData, fileInputRef, fileSelected, uploadFile } = useFileLoader(
    "AVATAR",
    handleUploadSuccess,
    handleUploadError,
    onUploadProgress
  );

  const defaultAvatar =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  const getAvatarUrl = (user?: User): string => {
    if (!user) return defaultAvatar;
    const avatarPath = user.avatar || user.picture;
    if (!avatarPath) return defaultAvatar;
    if (avatarPath.match(/^https?:\/\//)) return avatarPath;
    return `${combineUrlAndPath(
      REACT_APP_FILES || "",
      avatarPath
    )}?t=${new Date().getTime()}`;
  };

  const handleImageClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    fileSelected(e);
    if (e.target.files && e.target.files.length > 0) {
      try {
        setIsUploading(true);
        await uploadFile(e.target.files);
      } catch {
        console.error("Upload error:", e);
        if (onUploadError) {
          onUploadError("Failed to upload image.");
        }
        setIsUploading(false);
      }
    }
  };

  async function handleUploadSuccess(response: any) {
    try {
      if (onUploadSuccess) {
        await onUploadSuccess(response);
      }
    } finally {
      setIsUploading(false);
    }
  }

  function handleUploadError(error: string) {
    console.error("Upload error:", error);
    if (onUploadError) {
      onUploadError(error);
    }
    setIsUploading(false);
  }

  return (
    <div
      className={`relative inline-block  ${
        isUploading ? "cursor-wait" : "cursor-pointer"
      }`}
      style={{ maxWidth: "200px" }}
      onClick={handleImageClick}
    >
      <img
        src={fileData || getAvatarUrl(user)}
        alt={`${user?.firstname || ""} ${user?.lastname || ""}`}
        className={`rounded-full w-30 h-30 object-cover border-4 border-grey-300 transition-opacity ${
          isUploading ? "opacity-60" : "opacity-100"
        }`}
        style={{ maxWidth: "200px" }}
      />
      {!isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"></div>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-70">
          <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default AvatarUpload;
