import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("https://talkfusion-3uw7.onrender.com/chat", {
        message: input
      });

      const botMessage = {
        sender: "bot",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Backend not responding. Check FastAPI server.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">

      <header className="p-4 shadow-lg bg-gray-800 text-lg font-semibold text-center">
        TalkFusion 🤖
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] p-3 rounded-xl ${msg.sender === "user"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700 mr-auto"
              }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="bg-gray-700 p-3 rounded-xl w-fit mr-auto">
            <div className="animate-pulse">AI is typing...</div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="p-4 bg-gray-800 flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 p-3 rounded-lg bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
