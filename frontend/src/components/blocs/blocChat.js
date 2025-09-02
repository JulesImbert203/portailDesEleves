import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

// "undefined" means the URL will be computed from the `window.location` object

export default function BlocChat() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const URL = 'http://localhost:5000';

    const socket = io(URL, {
        withCredentials: true
    });

  useEffect(() => {
    const socket = io();
    socket.on('message', (data) => {
      setChatLog([...chatLog, data.data]);
    });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div>
      <h1>Chat App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {chatLog.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
}