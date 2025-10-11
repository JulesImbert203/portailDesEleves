import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { SOCKET_BASE_URL } from '../../api/base';
import "../../assets/styles/chat.scss"
import { obtenirPlusDeMessages } from '../../api/api_chat';
import { Card, Form, InputGroup } from 'react-bootstrap';

export default function BlocChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const messageDisplayRef = useRef(null);
  const isAtBottomRef = useRef(true); // Ref to track if user is at the bottom

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

  // Auto-scroll to bottom when new messages arrive, but only if user was already at the bottom
  useEffect(() => {
    const messageDisplay = messageDisplayRef.current;
    if (messageDisplay && isAtBottomRef.current) {
      messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const message = { text: input };
    socket.emit("message", message);
    setInput("");
    // After sending a message, always scroll to the bottom
    const messageDisplay = messageDisplayRef.current;
    if (messageDisplay) {
      messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }
  };

  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Check if user is at the very bottom (with a small tolerance)
    isAtBottomRef.current = scrollHeight - scrollTop <= clientHeight + 1; // +1 for tolerance

    if (scrollTop === 0) {
      async function fecthNewMessages() {
        if (messages.length > 0) {
          const new_messages = await obtenirPlusDeMessages(messages[0].id)
          setMessages(new_messages.concat(messages))
        }
      };
      fecthNewMessages();
    }
  }

  return (
    <Card id="chat-container" className='mw-100 mb-3'>
      <Card.Header as="h5" className="text-center">Chat</Card.Header>
      <Card.Body>
        <div ref={messageDisplayRef} id="message-display" className="overflow-auto mb-3" onScroll={handleScroll}>
          {messages.map((msg, idx) => (
            <div key={idx} className="p-1 rounded-lg bg-light chat-message">
              <span className="text-muted">{msg.time}</span>{" "}
              <span className={msg.is_you ? "chat-author-me" : "chat-author-other"}>
                {msg.author}
              </span>{" "}
              :{" "}
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <InputGroup >
          <Form.Control className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Parle moi !!!"
          />
        </InputGroup>
      </Card.Body>
    </Card>
  );
}
