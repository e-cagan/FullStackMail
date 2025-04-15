import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const EmailList = ({ emails, onEmailAction, emailType }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <h3 className="text-lg font-medium">No emails found</h3>
        <p className="mt-2">
          {emailType === 'inbox' && "Your inbox is empty."}
          {emailType === 'sent' && "You haven't sent any emails yet."}
          {emailType === 'spam' && "No spam emails detected."}
          {emailType === 'archived' && "You haven't archived any emails yet."}
          {emailType === 'unread' && "You don't have any unread emails."}
        </p>
        {emailType !== 'sent' && emailType !== 'archived' && emailType !== 'read' && emailType !== 'spam' && (
          <Link to="/compose" className="mt-4 inline-block text-blue-500 hover:underline">
            Compose a new email
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {emails.map((email) => (
          <li key={email.id} className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${!email.is_read && 'bg-blue-50'}`}>
            <div className="flex-1 min-w-0">
              <Link to={`/emails/${email.id}`} className="block">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium truncate ${!email.is_read ? 'text-black' : 'text-gray-600'}`}>
                    {email.subject}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(email.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {email.body.length > 100 ? `${email.body.substring(0, 100)}...` : email.body}
                </p>
              </Link>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              {email.is_spam && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                  Spam
                </span>
              )}
              
              {/* Delete button - show in all views */}
              <button 
                onClick={() => onEmailAction(email.id, 'delete')} 
                className="mr-2 text-gray-400 hover:text-red-500" 
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
              
              {/* Archive/Unarchive button - don't show in sent emails */}
              {emailType !== 'sent' && (
                emailType === 'archived' ? (
                  <button 
                    onClick={() => onEmailAction(email.id, 'unarchive')} 
                    className="mr-2 text-gray-400 hover:text-gray-600" 
                    title="Unarchive"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4l3 3m0 0l3-3m-3 3V4"></path>
                    </svg>
                  </button>
                ) : (
                  <button 
                    onClick={() => onEmailAction(email.id, 'archive')} 
                    className="mr-2 text-gray-400 hover:text-gray-600" 
                    title="Archive"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                    </svg>
                  </button>
                )
              )}
              
              {/* Read/Unread button - show only in inbox/spam/archived/unread views */}
              {(emailType === 'inbox' || emailType === 'archived') && (
                !email.is_read ? (
                  <button 
                    onClick={() => onEmailAction(email.id, 'read')} 
                    className="text-gray-400 hover:text-gray-600" 
                    title="Mark as read"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
                    </svg>
                  </button>
                ) : (
                  <button 
                    onClick={() => onEmailAction(email.id, 'unread')} 
                    className="text-gray-400 hover:text-gray-600" 
                    title="Mark as unread"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                  </button>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailList;