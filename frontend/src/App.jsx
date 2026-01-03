import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://talkfusion-3uw7.onrender.com/chat",
        { message: input }
      );

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Backend not responding." },
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
            className={`relative group max-w-[75%] p-3 rounded-xl ${
              msg.sender === "user"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700 mr-auto"
            }`}
          >
            {/* Copy full message (AI only) */}
            {msg.sender === "bot" && (
              <button
                onClick={() => copyToClipboard(msg.text, idx)}
                className="absolute top-2 right-2 text-xs bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                {copiedIndex === idx ? "Copied ✓" : "Copy"}
              </button>
            )}

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, children }) {
                  const codeText = String(children).trim();

                  if (inline) {
                    return (
                      <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative my-2">
                      <button
                        onClick={() => copyToClipboard(codeText, `code-${idx}`)}
                        className="absolute top-2 right-2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Copy
                      </button>

                      <pre className="bg-black text-green-400 p-3 rounded-lg overflow-x-auto text-sm">
                        <code>{codeText}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}

        {loading && (
          <div className="bg-gray-700 p-3 rounded-xl w-fit mr-auto animate-pulse">
            Fusion is typing...
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
