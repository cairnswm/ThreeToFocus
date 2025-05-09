import React, { useState, useEffect, FormEvent } from 'react';
import { accessElf } from '../../utils/accessElf';
import { useAuth } from '../../hooks/useAuth';
import AvatarUpload from './AvatarUpload';
import Navigation from '../../../application/Navigation';
import Container from '../../../components/Container';

interface ProfilePageProps {
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  
  const { user, saveUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstname || '');
      setLastName(user.lastname || '');
    }
  }, []);

  accessElf.track('ProfilePage');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstname || '');
      setLastName(user.lastname || '');
    }
  }, [user]);

  const handleUploadSuccess = async (filename: string) => {
    try {
      if (!filename) throw new Error('Invalid upload response - no filename received');

      const updatedUser = { ...user, avatar: filename } as User;
      const result = await saveUser(updatedUser);

      if (result?.errors) throw new Error('Failed to save user data');
      setSuccess('Profile picture updated successfully!');
    } catch {
      setError('Failed to update profile picture in database.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = { ...user, firstname: firstName, lastname: lastName } as User;
      const result = await saveUser(updatedUser);

      if (result?.errors) throw new Error('Failed to save user data');
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setFirstName(user?.firstname || '');
    setLastName(user?.lastname || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <Container>
      <Navigation />
      <div className="max-w-2xl mx-auto mt-2">
        <div className="flex flex-col items-center mb-6">
            <AvatarUpload user={user} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadSuccess(file.name);
              }}
            />
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full border rounded p-2 ${!isEditing && "bg-dark-100"}`}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full border rounded p-2 ${!isEditing && "bg-dark-100"}`}
              disabled={!isEditing}
            />
          </div>
          {isEditing ? (
            <div className="flex space-x-4">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          )}
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Click on the profile picture to change your avatar
        </p>
      </div>
    </Container>
  );
};

export default ProfilePage;
