import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { apiUrl } from '../../constants';

const EmailDetail = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [senderInfo, setSenderInfo] = useState(null);

  useEffect(() => {
    const fetchEmailDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${apiUrl}/emails/${emailId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch email details');
        }

        const data = await response.json();
        setEmail(data);
        
        // Fetch sender info
        if (data.sender_id) {
          try {
            const usersResponse = await fetch(`${apiUrl}/users`, {
              credentials: 'include'
            });
            
            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              const sender = usersData.users.find(user => user.id === data.sender_id);
              setSenderInfo(sender);
            }
          } catch (error) {
            console.error('Error fetching sender info:', error);
          }
        }
        
        // Mark email as read if not already
        if (!data.is_read) {
          await fetch(`${apiUrl}/email/${emailId}/action`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'read' }),
            credentials: 'include'
          });
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailDetails();
  }, [emailId]);

  const handleAction = async (action) => {
    try {
      const response = await fetch(`${apiUrl}/email/${emailId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} email`);
      }

      if (action === 'delete') {
        navigate('/dashboard');
      } else {
        // Update local state to reflect changes
        setEmail({
          ...email,
          is_archived: action === 'archive' ? true : (action === 'unarchive' ? false : email.is_archived)
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
        <div className="text-center">
          <Link to="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Email not found.</p>
        <Link to="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Inbox
        </Link>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleAction('delete')} 
            className="text-gray-600 hover:text-red-500 flex items-center"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
          {!email.is_archived ? (
            <button 
              onClick={() => handleAction('archive')} 
              className="text-gray-600 hover:text-gray-800 flex items-center" 
              title="Archive"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
              </svg>
            </button>
          ) : (
            <button 
              onClick={() => handleAction('unarchive')} 
              className="text-gray-600 hover:text-gray-800 flex items-center" 
              title="Unarchive"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4l3 3m0 0l3-3m-3 3V4"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
        
        {email.is_spam && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>This email has been marked as spam.</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded">
          <div>
            <p>
              <span className="font-semibold">From:</span> {senderInfo ? senderInfo.username : `User ${email.sender_id}`}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Date:</span> {formatDate(email.created_at)}
            </p>
          </div>
        </div>
        
        <div className="prose max-w-none">
          {/* Display email body with proper line breaks */}
          {email.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link 
          to={`/compose?reply=${email.id}`} 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          Reply
        </Link>
      </div>
    </div>
  );
};

export default EmailDetail;