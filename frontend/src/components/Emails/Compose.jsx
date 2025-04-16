import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { apiUrl } from '../../constants';

const Compose = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const replyToId = queryParams.get('reply');

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [originalEmail, setOriginalEmail] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(`https://ismailspam.onrender.com/users`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users.filter(user => user.id !== currentUser.id));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchReplyEmail = async () => {
      if (replyToId) {
        try {
          const response = await fetch(`https://ismailspam.onrender.com/emails/${replyToId}`, {
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch original email');
          }

          const data = await response.json();
          setOriginalEmail(data);
          
          // Pre-fill form for reply
          setFormData({
            recipient_id: data.sender_id,
            subject: `Re: ${data.subject}`,
            body: `\n\n------------ Original Message ------------\n${data.body}`
          });
        } catch (error) {
          console.error('Error fetching reply email:', error);
        }
      }
    };

    fetchUsers();
    if (replyToId) {
      fetchReplyEmail();
    }
  }, [replyToId, currentUser]);

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

    try {
      const response = await fetch(`https://ismailspam.onrender.com/send_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      navigate('/dashboard', { state: { message: 'Email sent successfully!' } });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Compose Email</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipient">
            To:
          </label>
          {loadingUsers ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
          ) : (
            <select
              id="recipient"
              name="recipient_id"
              value={formData.recipient_id}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select recipient</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
            Subject:
          </label>
          <input
            id="subject"
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="body">
            Message:
          </label>
          <textarea
            id="body"
            name="body"
            placeholder="Type your message here..."
            value={formData.body}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64"
            required
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Compose;