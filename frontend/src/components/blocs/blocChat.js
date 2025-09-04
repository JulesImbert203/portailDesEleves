import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { SOCKET_BASE_URL } from '../../api/base';
import { useLayout } from '../../layouts/Layout';

export default function BlocChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const { userData } = useLayout();

  useEffect(() => {
    // Connect to backend Socket.IO server
    const newSocket = io(`${SOCKET_BASE_URL}`, {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("message", (message) => {
      setMessages((prev) => [...prev, { text: message.text, time: message.time, author: message.author }]);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const message = { text: input };
    socket.emit("message", message);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg flex flex-col p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Chat</h1>
        <div className="flex-1 mb-4 space-y-2" style={{ overflow: "hidden" }}>
          {messages.map((msg) => (
            <div>
              <span style={{ color: "grey", fontSize: "0.7em" }}>{msg.time}</span> <span style={{ color: msg.author_id === userData.id ? "grey" : "blue" }}>{msg.author}</span> : {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border rounded-xl px-3 py-2 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}