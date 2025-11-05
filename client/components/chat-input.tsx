import { useState, useEffect } from 'react';
import { BsArrowUpShort } from 'react-icons/bs';
import axios from 'axios';
import { useChat } from '@/contexts/chat.context';
import { useUser } from '@/contexts/user.context';

const ChatInput = () => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const { currentChat, setCurrentChat, addToHistory, newChat } = useChat();
    const { user } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || isLoading) return;

        const message_url = "http://localhost:5678/webhook/chat21";
        const sessionId = currentChat?.id || '';
        const userMessage = message.trim();

        const userHistoryItem = {
            id: Date.now() + 1,
            session_id: sessionId,
            message: userMessage,
            createdAt: new Date().toISOString(),
            type: "human" as const
        };

        setIsLoading(true);
        if (isFirstMessage) {
            setIsFirstMessage(false);
            const id = user?.id || '';
            let chatId = '';

            setMessage('');
            // If newChat creates a new chat and returns its ID, you might want to set chatId here
            newChat && (chatId = (await newChat(userMessage, id))?.id || '');
            console.log('New chat created with ID:', chatId);
            try {

                const response = await axios.post(message_url, {
                    sessionId: chatId || sessionId,
                    chatInput: userMessage
                });

                const aiResponse = response.data;
                const aiHistoryItem = {
                    id: aiResponse.id || Date.now() + 1,
                    session_id: chatId || sessionId,
                    message: aiResponse.output || aiResponse.content || aiResponse,
                    createdAt: aiResponse.createdAt || new Date().toISOString(),
                    type: "ai" as const
                };

                addToHistory && addToHistory(aiHistoryItem);

                setCurrentChat && setCurrentChat({
                    id: chatId,
                    user_id: id,
                    chatTitle: userMessage.length > 20 ? userMessage.slice(0, 20) + "..." : userMessage,
                    updatedAt: new Date().toISOString()
                });

                console.log('Message sent successfully');
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setIsLoading(false);
            }
        }

        else {
            try {
                // First, add the user's message to history

                addToHistory && addToHistory(userHistoryItem);

                // Clear input immediately after adding user message
                setMessage('');

                // Send message to backend
                console.log('sending message to n8n...', sessionId, userMessage, userHistoryItem);
                const response = await axios.post(message_url, {
                    sessionId: sessionId,
                    chatInput: userMessage
                });

                // Add AI response to history
                const aiResponse = response.data;
                console.log('Response from n8n:', response.data);
                const aiHistoryItem = {
                    id: aiResponse.id || Date.now() + 1,
                    session_id: sessionId,
                    message: aiResponse.output || aiResponse.content || aiResponse,
                    createdAt: aiResponse.createdAt || new Date().toISOString(),
                    type: "ai" as const
                };

                addToHistory && addToHistory(aiHistoryItem);

                console.log('Message sent successfully');

            } catch (error) {
                console.error('Error sending message:', error);
                // Optionally show error message to user
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    useEffect(() => {
        if (currentChat === undefined) {
            setIsFirstMessage(true);
        } else {
            setIsFirstMessage(false);
        }
    }, [currentChat])

    return (
        <div className="border-t border-neutral-800 bg-neutral-900 p-4">
            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={1}
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                        <BsArrowUpShort className="h-5 w-5" />
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatInput;
