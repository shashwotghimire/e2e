import { useEffect, useState, useRef } from "react";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import axios from "axios";
import { socket } from "@/socket";
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
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Chat List */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Chats</h2>

        <Dialog>
          <DialogTrigger>
            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
              +
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
              <form onSubmit={handleCreateNewChat}>
                <Input
                  placeholder="Chat Name"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                />
                <br></br>
                <Input
                  placeholder="Enter Reciever's usernames"
                  value={recieverUsername}
                  onChange={(e) => setRecieverUsername(e.target.value)}
                />
                <br></br>
                <Button type="submit">Create New Chat</Button>
                {error && <p>{error}</p>}
              </form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="p-4 cursor-pointer hover:bg-gray-100 border-b"
              onClick={() => handleOpenChat(chat)}
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
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 border rounded"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  {
                    if (e.key === "Enter") handleSendMessage();
                  }
                }}
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
