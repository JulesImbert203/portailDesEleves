import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { SOCKET_BASE_URL } from '../../api/base';
import { useLayout } from '../../layouts/Layout';
import "../../assets/styles/chat.css"
import { obtenirPlusDeMessages } from '../../api/api_chat';

export default function BlocChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [loadNewMessages, setLoadNewMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(`${SOCKET_BASE_URL}`, {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("message", (message) => {
      setMessages((prev) => [
        ...prev,
        { text: message.text, time: message.time, author: message.author, is_you: message.is_you, id: message.id }
      ]);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fecthNewMessages() {
      if (messages.length > 0) {
        const new_messages = await obtenirPlusDeMessages(messages[0].id)
        setMessages(new_messages.concat(messages))
      }
    };
    fecthNewMessages();
    setLoadNewMessages(false);
  }, [loadNewMessages])

  const sendMessage = () => {
    if (!input.trim()) return;
    const message = { text: input };
    socket.emit("message", message);
    setInput("");
  };

  const handleScroll = e => {
    let element = e.target;
    if (element.scrollTop === 0) {
      setLoadNewMessages(true)
    }
  }

  return (
    <div id="chat-container " className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-lg flex flex-col p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Chat</h1>

      {/* Messages container with its own scroll bar */}
      <div
        className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-2" id="message-display"
        onScroll={handleScroll}>
        {messages.map((msg, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-gray-100">
            <span style={{ color: "grey", fontSize: "0.7em" }}>{msg.time}</span>{" "}
            <span style={{ color: msg.is_you ? "blue" : "gray" }}>
              {msg.author}
            </span>{" "}
            : {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4">
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
  );
}
