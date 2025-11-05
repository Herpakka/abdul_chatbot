import React, { useEffect, useRef, useMemo, useState, useContext } from 'react';
import { BsArrowDown, BsBarChart, BsTable } from 'react-icons/bs';
import { useChat } from '@/contexts/chat.context';
import { detectArtifactFromMessage } from '../utils/artifactDetector';
import { ArtifactContext } from '@/app/chat/page';



const BotMessage = ({ message }) => {
    // Handle empty message case
    if (message.content === "") {
        return (
            <div className="flex justify-start mb-4 w-full">
                <div className="flex items-start gap-3 max-w-[85%] min-w-0">
                    {/* Bot avatar */}
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-medium">AI</span>
                    </div>
                    {/* Message bubble with flexible markdown content */}
                    <div className="bg-red-800 text-white p-3 rounded-lg rounded-tl-sm flex-1 min-w-0">
                        <div
                            className="whitespace-pre-wrap break-words"
                        >message not found. try again</div>
                    </div>
                </div>
            </div>
        )
    }
    
    const { setShowArtifact } = useContext(ArtifactContext)!;
    
    // Chart detection functions
    const jsonChartRegex = /```json\s*\n([\s\S]*?)```/gi;
    const chartDetect = (message: string) => {
        const match = message.match(jsonChartRegex);
        if (match) {
            return "⬇️กดดูแผนภูมิด้านล่าง";
        }
        return null;
    };
    
    // Edit chart text function
    const editChartText = (text: string): string => {
        return text.replace(jsonChartRegex, (match) => {
            const replacement = chartDetect(match);
            return replacement || match;
        });
    };
    
    // Memoized processed message with chart replacement
    const processedMessage = useMemo(() => editChartText(message), [message]);
    
    const artifactContext = useContext(ArtifactContext);
    const [detectedArtifact, setDetectedArtifact] = useState<any>(null);

    const handleOpenArtifact = () => {
        if (detectedArtifact && artifactContext) {
            artifactContext.setSelectedArtifactType(detectedArtifact.type);
            if (detectedArtifact.data !== artifactContext.artifactData) {
                artifactContext.setArtifactData(detectedArtifact.data);
                setShowArtifact(true);
            } else {
                !artifactContext.showArtifact ? setShowArtifact(true) : setShowArtifact(false);
            }
            // You might need to add a state to control artifact visibility
            // artifactContext.setShowArtifact(true);
        }
    };

    useEffect(() => {
        // Detect artifact when message changes
        const artifact = detectArtifactFromMessage(message);
        setDetectedArtifact(artifact);
    }, [message]);

    return (
        <div className="flex justify-start mb-4 w-full">
            <div className="flex items-start gap-3 max-w-[85%] min-w-0">
                {/* Bot avatar */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-medium">AI</span>
                </div>
                {/* Message bubble with flexible markdown content */}
                <div className="bg-neutral-800 text-white p-3 rounded-lg rounded-tl-sm flex-1 min-w-0">
                    <div
                        className="whitespace-pre-wrap break-words"
                        onClick={() => console.log(detectArtifactFromMessage(message))}
                    >{processedMessage}</div>

                    {/* Artifact Button */}
                    {detectedArtifact && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <button
                                onClick={handleOpenArtifact}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                            >
                                {detectedArtifact.type === 'chart' ? (
                                    <>
                                        <BsBarChart className="w-4 h-4 mr-2" />
                                        Open Chart
                                    </>
                                ) : (
                                    <>
                                        <BsTable className="w-4 h-4 mr-2" />
                                        Open Table
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const UserMessage = ({ message }: { message: string }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[70%] shadow-sm">
            <div className="whitespace-pre-wrap break-words">
                {message}
            </div>
        </div>
    </div>
);

export default function ChatRoom() {
    const { currentChat, history } = useChat();
    const sortedHistory = [...history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    // Show scroll down button if not at bottom
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const threshold = 60; // px from bottom
            const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
            setShowScrollDown(!atBottom);
        };

        container.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => container.removeEventListener('scroll', handleScroll);
    }, [scrollContainerRef, history]);

    // Process messages from the chat context
    const messages = history || [];
    const chatMessages = messages.map((msg: any, index: number) => {
        const content = msg?.message?.content;
        return {
            id: msg.id || index.toString(),
            sender: msg?.message?.type,
            message: typeof content === 'string' ? content.trim() : ''
        };
    });

    if (!currentChat) {
        return (
            <div className="flex items-center justify-center h-full text-neutral-400">
                <div className="text-center">
                    <div className="text-lg mb-2">No chat selected</div>
                    <div className="text-sm">Select a chat from the sidebar to start messaging</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Chat Messages Container */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                <>
                    {sortedHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-neutral-400">
                            <div className="text-center">
                                <div className="text-lg mb-2">Start a conversation</div>
                                <div className="text-sm">Send a message to get started</div>
                            </div>
                        </div>
                    ) : (
                        sortedHistory.map((msg: any) => {
                            // Extract the content from the message object
                            // const messageContent = msg.message || msg.message?.content || '';
                            // const messageType = msg.type || msg.message?.type;
                            let messageContent = '';
                            let messageType = '';
                            if (msg.message?.content) {
                                messageContent = msg.message.content;
                            } else {
                                messageContent = msg.message || '';
                            }
                            if (msg.message?.type) {
                                messageType = msg.message.type;
                            } else {
                                messageType = msg.type || '';
                            }

                            // console.log('Rendering message:', { id: msg.id, type: messageType, content: messageContent });

                            // Handle different message types
                            if (messageType === 'human') {
                                return <UserMessage key={String(msg.id)} message={messageContent} />;
                            } else if (messageType === 'ai') {
                                return <BotMessage key={String(msg.id)} message={messageContent} />;
                            } else {
                                // Fallback for unknown message types
                                return (
                                    <div key={String(msg.id)} className="flex justify-center mb-4">
                                        <div className="bg-neutral-700 text-neutral-300 p-2 rounded text-xs">
                                            Unknown message type: {JSON.stringify(msg)}
                                        </div>
                                    </div>
                                );
                            }
                        })
                    )}
                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                </>
            </div>
            {/* Floating Scroll Down Button */}
            {showScrollDown && (
                <button
                    className="fixed bottom-24 right-8 z-50 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded shadow-lg transition-all duration-200 flex items-center justify-center"
                    onClick={scrollToBottom}
                    aria-label="Scroll to bottom"
                    type="button"
                >
                    <BsArrowDown size={15} />
                </button>
            )}
        </div>
    );
}