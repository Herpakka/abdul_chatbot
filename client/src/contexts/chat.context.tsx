import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Axios from "axios";
import { useRouter } from "next/navigation";
import { getCookie } from "./context-utils";
import { useUser } from "./user.context";

export interface Chat {
    id: string;
    user_id: string;
    chatTitle: string;
    updatedAt: string;
}

interface History {
    id: number;
    session_id: string;
    message: string;
    createdAt: string;
    type?: "human" | "ai";
}

interface ChatContextType {
    chats: Chat[];
    currentChat?: Chat;
    setCurrentChat: (chat: Chat | undefined) => void;
    newChat?: (message: string, userId: string) => Promise<any>;
    deleteChat?: (chatId: string) => Promise<void>;
    renameChat?: (chatId: string, newTitle: string) => Promise<void>;
    history: History[];
    setHistory: React.Dispatch<React.SetStateAction<History[]>>;
    addToHistory?: (message: History) => void;
    loading: boolean;
    error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
    const router = useRouter();

    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);
    const [history, setHistory] = useState<History[]>([]); // Rename from histories 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const chatUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/chats`;

    // use user context
    const { user, loading: userLoading, error: userError } = useUser();
    const userId = user?.id;

    // Helper function to add new message to history
    const addToHistory = (message: History) => {
        console.log('Adding to history:', message);
        setHistory(prev => [...prev, message]);
    };

    const newChat = async (message: string, userId: string) => {
        // Function to create a new chat session
        const chatTitle = message.length > 20 ? message.slice(0, 20) + "..." : message;
        const response = await Axios.post(`${chatUrl}/create`, {
            chatTitle, userId: userId
        }, {
            headers: { Authorization: `Bearer ${getCookie("token")}` },
        })

        const newChat: Chat = {
            id: response.data.id,
            user_id: userId,
            chatTitle: chatTitle,
            updatedAt: response.data.updatedAt
        };
        setChats(prev => [...prev, newChat]);
        return response.data;
    }

    const deleteChat = async (chatId: string) => {
        const response = await Axios.delete(`${chatUrl}/delete/${chatId}`, {
            headers: { Authorization: `Bearer ${getCookie("token")}` },
        })
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChat?.id === chatId) {
            setCurrentChat(undefined);
            setHistory([]);
        }
        return response.data;
    }

    const renameChat = async (chatId: string, newTitle: string) => {
        const response = await Axios.put(`${chatUrl}/update/${chatId}`, {
            chatTitle: newTitle
        }, {
            headers: { Authorization: `Bearer ${getCookie("token")}` },
        })
        setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, chatTitle: newTitle } : chat));
        if (currentChat?.id === chatId) {
            setCurrentChat(prev => prev ? { ...prev, chatTitle: newTitle } : prev);
        }
    }

    // รอให้ user context โหลดเสร็จก่อน
    useEffect(() => {
        // ถ้า user ยังโหลดอยู่ ให้รอ
        if (userLoading) {
            return;
        }

        // ถ้า user error หรือไม่มี user ให้ redirect
        if (userError || !user) {
            setLoading(false);
            setChats([]);
            router.push("/auth/login");
            return;
        }

        // ถ้ามี user แล้ว ค่อยโหลด chats
        const token = getCookie("token");
        if (!token) {
            setLoading(false);
            setChats([]);
            router.push("/auth/login");
            return;
        }

        // โหลด chats ด้วย userId ที่แน่นอน
        Axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/chats/list/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                setChats(res.data);
                setError(null);
            })
            .catch((err) => {
                if (err.response && err.response.status === 401) {
                    setError("Session expired. Please login again.");
                    setChats([]);
                } else {
                    setError("Failed to fetch chats.");
                    setChats([]);
                }
                router.push("/auth/login");
            })
            .finally(() => setLoading(false));
    }, [user, userLoading, userError, router]); // dependency ที่สำคัญ

    // fetch histories when currentChat changes
    useEffect(() => {
        if (currentChat) {
            Axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/history/${currentChat.id}`, {
                headers: { Authorization: `Bearer ${getCookie("token")}` },
            })
                .then((res) => {
                    setHistory(res.data);
                })
                .catch((err) => {
                    console.error("Failed to fetch chat history:", err);
                });
        }
    }, [currentChat]);

    

    return (
        <ChatContext.Provider
            value={{
                chats,
                currentChat,
                setCurrentChat,
                newChat,
                deleteChat,
                renameChat,
                history,
                setHistory,
                addToHistory,
                loading,
                error,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
