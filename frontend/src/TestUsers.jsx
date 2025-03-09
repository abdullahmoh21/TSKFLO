import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the token from local storage
  const getToken = () => {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      console.error('Error retrieving token:', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = getToken();
        console.log('Using token:', token);
        
        // Make the API call with the token
        const response = await axios.get('http://localhost:3200/user/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response:', response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.users) {
          setUsers(response.data.users);
        } else {
          setUsers(response.data || []);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Test Page</h2>
      
      {loading && <p>Loading users...</p>}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Users ({users.length})</h3>
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <ul className="border rounded divide-y">
              {users.map(user => (
                <li key={user._id} className="p-2">
                  {user.name || user.email} ({user._id})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Debug Info:
          <br />
          Token exists: {getToken() ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
};

export default TestUsers; 