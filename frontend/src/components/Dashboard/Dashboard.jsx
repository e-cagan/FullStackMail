import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import EmailList from '../Emails/EmailList';
import { apiUrl } from '../../constants';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      setError('');
      
      try {
        let endpoint;
        switch (activeTab) {
          case 'sent':
            endpoint = `${apiUrl}/emails/sent`;
            break;
          case 'read':
            endpoint = `${apiUrl}/emails/read`;
            break;
          case 'spam':
            endpoint = `${apiUrl}/emails/spam`;
            break;
          case 'archived':
            endpoint = `${apiUrl}/emails/archived`;
            break;
          default:
            endpoint = `${apiUrl}/emails/received`;
        }

        const response = await fetch(endpoint, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }

        const data = await response.json();
        
        // Extract the correct array based on the endpoint
        let emailsArray;
        if (activeTab === 'sent') {
          emailsArray = data.sent_emails || [];
        } else if (activeTab === 'spam') {
          emailsArray = data.spam_emails || [];
        } else if (activeTab === 'archived') {
          emailsArray = data.archived_emails || [];
        } else if (activeTab === 'read') {
          emailsArray = data.read_emails || [];
        } else {
          emailsArray = data.received_emails || [];
        }
        
        setEmails(emailsArray);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEmails();
    }
  }, [activeTab, currentUser]);

  const handleEmailAction = async (emailId, action) => {
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

      // Remove email from list if deleted, otherwise refresh list
      if (action === 'delete') {
        setEmails(emails.filter(email => email.id !== emailId));
      } else {
        // Refresh emails to get updated status
        const updatedEmails = emails.map(email => {
          if (email.id === emailId) {
            return {
              ...email,
              is_read: action === 'read' ? true : email.is_read,
              is_archived: action === 'archive' ? true : (action === 'unarchive' ? false : email.is_archived)
            };
          }
          return email;
        });
        setEmails(updatedEmails);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {activeTab === 'inbox' && 'Inbox'}
            {activeTab === 'read' && 'Read'}
            {activeTab === 'sent' && 'Sent'}
            {activeTab === 'spam' && 'Spam'}
            {activeTab === 'archived' && 'Archived'}
          </h1>
          <Link 
            to="/compose" 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Compose
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <EmailList 
            emails={emails} 
            onEmailAction={handleEmailAction} 
            emailType={activeTab}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;