import { useEffect, useState, useRef } from "react";
import type { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import axios from "axios";
import { socket } from "@/socket";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

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
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // create chat
  const [chatName, setChatName] = useState<string>("");
  const [recieverUsername, setRecieverUsername] = useState<string>("");

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

  const handleOpenChat = (chat: Chat) => {
    setSelectedChat(chat);
    setSelectedChatId(chat.id);

    if (!socket.connected) {
      if (token) socket.auth = { token };
      socket.connect();
    }
    // here socket io client is connected to server socket io
    socket.emit("join_chat", chat.id);
    console.log("emitted join chat for ", chat.id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;

    socket.emit("send_message", {
      chatId: selectedChatId,
      content: newMessage,
      senderId: user?.id,
    });

    setNewMessage("");
    setError(null);
  };

  useEffect(() => {
    socket.on("recieve_message", (messages: ChatMessages) => {
      setMessages((prev) => [...prev, messages]);
    });
    return () => {
      socket.off("recieve_message");
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages]);

  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${url}/api/chats/chat`,
        {
          name: chatName,
          recieverUsername: recieverUsername,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatName("");
      setRecieverUsername("");
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar: Chat List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chats</h2>
          <Dialog>
            <DialogTrigger>
              <Button>New Chat</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Create New Chat
                </DialogTitle>
                <form onSubmit={handleCreateNewChat} className="space-y-4 mt-4">
                  <Input
                    placeholder="Chat Name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <Input
                    placeholder="Enter Receiver's username"
                    value={recieverUsername}
                    onChange={(e) => setRecieverUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-md transition-colors"
                  >
                    Create New Chat
                  </Button>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleOpenChat(chat)}
              >
                <p className="font-medium text-gray-900">{chat.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Members: {chat.members.map((m) => m.user.username).join(", ")}
                </p>
                {chat.messages.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2 truncate">
                    {chat.messages[0].sender.username}:{" "}
                    {chat.messages[0].content}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 p-4 bg-white">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedChat.name}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg: any) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-xs">
                    <span className="font-medium text-gray-900 text-sm">
                      {msg.sender.username}
                    </span>
                    <p className="text-gray-700 mt-1">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default Home;
