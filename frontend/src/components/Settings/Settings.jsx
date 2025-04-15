import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Settings = () => {
  const { currentUser } = useContext(AuthContext);
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences.</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Profile Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Username</p>
                <p className="font-medium">{currentUser.username}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Account Created</p>
                <p className="font-medium">{currentUser.created_at}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-4">Security</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-gray-500 text-sm">Change your password regularly to keep your account secure.</p>
              </div>
              <Link
                to="/change-password"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;