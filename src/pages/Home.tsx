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
import VideoChat from "@/components/VideoChat";

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
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [chatName, setChatName] = useState<string>("");
  const [recieverUsername, setRecieverUsername] = useState<string>("");

  // vid chat
  const [vidChat, setVidChat] = useState(false);

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
      const res = await axios.post(
        `${url}/api/chats/chat`,
        {
          name: chatName,
          recieverUsername: recieverUsername,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats((prev) => [...prev, res.data.chat]);
      setChatName("");
      setRecieverUsername("");
      setError(null);
      setDialogOpen(false);
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar: Chat List */}
      <div className="w-[360px] bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-foreground mb-4">Chats</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <div className="w-full bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-md transition-colors flex items-center justify-center cursor-pointer">
                New Chat
              </div>
            </DialogTrigger>
            <DialogContent className="bg-card border border-border rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Create New Chat
                </DialogTitle>
                <form onSubmit={handleCreateNewChat} className="space-y-4 mt-4">
                  <Input
                    placeholder="Chat Name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
                  />
                  <Input
                    placeholder="Who do you want to chat with ?"
                    value={recieverUsername}
                    onChange={(e) => setRecieverUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
                  />
                  <Button type="submit" className="">
                    Create New Chat
                  </Button>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-2">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors rounded-md border border-transparent hover:border-border shadow-sm"
                onClick={() => handleOpenChat(chat)}
              >
                <p className="font-medium text-foreground">{chat.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Members: {chat.members.map((m) => m.user.username).join(", ")}
                </p>
                {chat.messages && chat.messages.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2 truncate">
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
            <div className="border-b border-border p-4 bg-card">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedChat.name}
              </h3>
              <div className="flex">
                <Button
                  className="ml-auto"
                  onClick={() => setVidChat(!vidChat)}
                >
                  Video Chat
                </Button>
              </div>
              {vidChat && <VideoChat chatId={selectedChatId} />}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((msg: any) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="bg-card p-3 rounded-lg shadow-sm border border-border max-w-xs">
                    <span className="font-medium text-foreground text-sm">
                      {msg.sender.username}
                    </span>
                    <p className="text-muted-foreground mt-1">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-card border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-border rounded-full bbg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button
                  type="button"
                  className="px-5 rounded-full"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
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
