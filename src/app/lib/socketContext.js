'use client';
import React, { createContext, useState, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { toast } from 'react-toastify';

const SocketContext = createContext();

// Connect to the backend server
//const socket = io('http://localhost:9001', {
const socket = io('https://web-production-02f7b.up.railway.app', {
  autoConnect: false, // Prevent auto-connecting before setting listeners
  reconnection: true, // Allow reconnection attempts
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

const ContextProvider = ({ children }) => {
  const [me, setMe] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [cookies] = useCookies(['auth-token']);

  useEffect(() => {
    socket.connect();

    const token = cookies['auth-token'];
            if(token){
                const decodedUserData = jwt.decode(token);
                socket.emit('registerUser', decodedUserData.userId); 
                
            }

    // Listen for incoming notifications
    socket.on('notification', (data) => {
      console.log('Received Notification:', data);
      setNotifications((prev) => [...prev, data]);
      toast.info(`📢 ${data.message}`, { position: 'top-right', autoClose: 3000 });
    });

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, []);

  // ✅ Function to Send Notification to Another User
  const sendNotification = (recipientId, message) => {
    console.log('Sending notification to:', recipientId, message);
    socket.emit('sendNotification', { recipientId, message });
  };

  return (
    <SocketContext.Provider value={{
      me,
      notifications,
      sendNotification,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
