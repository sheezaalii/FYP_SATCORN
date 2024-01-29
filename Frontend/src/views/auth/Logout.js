import React, { useEffect } from 'react';
import Axios from 'axios';
import { useHistory } from 'react-router-dom';

function Logout() {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      // Make an HTTP request to log the user out
      await Axios.post('http://127.0.0.1:8000/api/logout', {
        headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, 
      });

      // Redirect to the login page or any other authorized route
      history.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  useEffect(() => {
    handleLogout();
  }, [history]);

  return (
    <div>Logging out...</div>
  );
}

export default Logout;
