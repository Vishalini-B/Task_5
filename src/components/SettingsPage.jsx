import React, { useState } from 'react';
import { Bell, Shield, Smartphone, AlertTriangle, DollarSign, CheckCircle2, Info, LogOut, Send, User, Camera, Save } from 'lucide-react';
import { requestNotificationPermission, sendLocalNotification, auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export function SettingsPage({ settings, profile, onUpdate, onLogout }) {

  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState(null);

  // Profile State
  const [displayName, setDisplayName] = useState(profile.displayName || auth.currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile.photoURL || auth.currentUser?.photoURL || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsUpdatingProfile(true);
    setProfileMessage(null);

    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL
      });

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        displayName,
        photoURL
      });

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMessage(null), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleEnablePush = async () => {
    setIsRequesting(true);
    setMessage(null);

    try {
      const token = await requestNotificationPermission();

      if (token) {
        onUpdate({ fcmToken: token });
        setMessage({ type: 'success', text: 'Push notifications enabled successfully!' });

        sendLocalNotification('Notifications Enabled!', {
          body: 'You will now receive alerts for bills and budget limits.',
        });

      } else {
        setMessage({ type: 'error', text: 'Failed to enable push notifications.' });
      }

    } catch (error) {
      setMessage({ type: 'error', text: 'Error enabling notifications.' });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = () => {
    sendLocalNotification('Test Notification', {
      body: 'This is a test notification from FinTrack!',
      tag: 'test-notification'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Profile Section */}
      <div className="card p-6">
        <h2 className="font-bold mb-4">Profile Settings</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">

          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="border p-2 w-full rounded"
          />

          <input
            type="url"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="Photo URL"
            className="border p-2 w-full rounded"
          />

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save'}
          </button>

          {profileMessage && (
            <p className={profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}>
              {profileMessage.text}
            </p>
          )}
        </form>
      </div>

      {/* Notification Section */}
      <div className="card p-6">
        <h2 className="font-bold mb-4">Notifications</h2>

        <button
          onClick={handleEnablePush}
          disabled={isRequesting || settings.fcmToken}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          {settings.fcmToken ? 'Enabled' : isRequesting ? 'Loading...' : 'Enable Push'}
        </button>

        {settings.fcmToken && (
          <button
            onClick={handleTestNotification}
            className="ml-4 text-indigo-600"
          >
            Test Notification
          </button>
        )}

        {message && (
          <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>
            {message.text}
          </p>
        )}
      </div>

      {/* Logout */}
      <div className="card p-6">
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

    </div>
  );
}