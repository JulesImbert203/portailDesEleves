import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { SOCKET_BASE_URL } from '../../api/base';
import "../../assets/styles/chat.scss"
import { obtenirPlusDeMessages } from '../../api/api_chat';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';

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
    <Card id="chat-container" className="fixed-bottom m-4 shadow-lg" style={{ width: '350px', right: '0', bottom: '0' }}>
      <Card.Header as="h5" className="text-center">Chat</Card.Header>
      <Card.Body>
        <div id="message-display" className="overflow-auto mb-3" onScroll={handleScroll}>
          {messages.map((msg, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-light">
              <span className="text-muted" style={{ fontSize: "0.7em" }}>{msg.time}</span>{" "}
              <span style={{ color: msg.is_you ? "blue" : "gray" }}>
                {msg.author}
              </span>{" "}
              : {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <InputGroup>
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <Button variant="primary" onClick={sendMessage}>Send</Button>
        </InputGroup>
      </Card.Body>
    </Card>
  );
}
