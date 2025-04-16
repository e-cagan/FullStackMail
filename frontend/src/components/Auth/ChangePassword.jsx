import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiUrl } from '../../constants';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.new_password !== formData.confirm_new_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://ismailspam.onrender.com/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: formData.old_password,
          new_password: formData.new_password
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setFormData({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Change Password</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="old_password">
            Current Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="old_password"
            type="password"
            name="old_password"
            placeholder="Current Password"
            value={formData.old_password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new_password">
            New Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="new_password"
            type="password"
            name="new_password"
            placeholder="New Password"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm_new_password">
            Confirm New Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirm_new_password"
            type="password"
            name="confirm_new_password"
            placeholder="Confirm New Password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;