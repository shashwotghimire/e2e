import { useEffect, useState } from "react";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import axios from "axios";

interface Chat {
  name: string;
  createdAt: string;
  id: string;
  members: {
    id: string;
    role: string;
    userId: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  }[];
  messages: {
    chatId: string;
    content: string;
    createdAt: string;
    id: string;
    sender: {
      id: string;
      email: string;
      username: string;
    };
  }[];
}

interface ChatMessages {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
}

function Home() {
  const url = import.meta.env.VITE_API_BASE_URL;
  const token = useSelector((state: RootState) => state.auth.token);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessages[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${url}/api/chats/latestChats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(res.data.chats);
      } catch (error: any) {
        setError(error.response?.data?.message || "something went wrong");
      }
    };
    if (token) fetchChats();
  }, [token]);

  useEffect(() => {
    if (!selectedChatId) return;

    const fetchChatMessages = async () => {
      try {
        const res = await axios.get(
          `${url}/api/chats/${selectedChatId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data.messages || []);
      } catch (e: any) {
        setError(e.response?.data?.e || null);
      }
    };
    fetchChatMessages();
  }, [selectedChatId]);
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Chat List */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Chats</h2>
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="p-4 cursor-pointer hover:bg-gray-100 border-b"
              onClick={() => {
                setSelectedChat(chat);
                setSelectedChatId(chat.id);
              }}
            >
              <p className="font-semibold">{chat.name}</p>
              <p className="text-sm text-gray-500">
                Members: {chat.members.map((m) => m.user.username).join(", ")}
              </p>
              {chat.messages.length > 0 && (
                <p className="text-sm text-gray-700 mt-1 truncate">
                  {chat.messages[0].sender.username}: {chat.messages[0].content}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            <div className="border-b p-2 font-bold text-lg">
              {selectedChat.name}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.map((msg: any) => (
                <div key={msg.id} className="p-2 rounded bg-gray-200 w-fit">
                  <span className="font-semibold">{msg.sender.username}:</span>{" "}
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-500 p-2 border-b bg-red-50">{error}</div>
      )}
    </div>
  );
}

export default Home;
