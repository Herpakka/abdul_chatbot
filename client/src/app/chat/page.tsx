"use client";

import { useState, createContext, useContext } from "react";
import { UserProvider} from "@/contexts/user.context";
import { ChatProvider, useChat } from "@/contexts/chat.context";
import { BsAsterisk, BsLayoutSidebar } from "react-icons/bs";
import Sidebar from "../../../components/sidebar";
import ChatRoom from "../../../components/chat-room";
import Artifact from "../../../components/artifact/artifact";
import ChatInput from "../../../components/chat-input";

export const ArtifactContext = createContext<{
    selectedArtifactType: 'chart' | 'table';
    setSelectedArtifactType: (type: 'chart' | 'table') => void;
    artifactData: any;
    setArtifactData: (data: any) => void;
    showArtifact: boolean;
    setShowArtifact: (show: boolean) => void;
} | null>(null);

const ChatName = () => {
    const { currentChat } = useChat();

    return (
        <div>{currentChat?.chatTitle || "No chat selected"}</div>
    );
};

export default function Page() {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isArtifactOpen, setIsArtifactOpen] = useState<boolean>(false);
    const [selectedArtifactType, setSelectedArtifactType] = useState<'chart' | 'table'>('chart');
    const [artifactData, setArtifactData] = useState<any>(null);

    const toggleSidebar = () => setIsSidebarOpen((v) => !v);
    const toggleArtifact = (type: 'chart' | 'table') => {
        setSelectedArtifactType(type);
        setIsArtifactOpen((v) => !v);
        !isArtifactOpen && setIsSidebarOpen(false);
        console.log("Toggling artifact viewer:", !isArtifactOpen);
    }

    return (
        <UserProvider>
            <ChatProvider>
                <ArtifactContext.Provider value={{
                    selectedArtifactType,
                    setSelectedArtifactType,
                    artifactData,
                    setArtifactData,
                    showArtifact: isArtifactOpen,
                    setShowArtifact: setIsArtifactOpen
                }}>
                    <div className="flex h-screen overflow-hidden bg-neutral-950 text-white">
                        {/* Sidebar */}
                        <Sidebar
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                        />

                        {/* Main content area */}
                        <div
                            className={[
                                "flex-1 flex flex-col transition-all duration-300 ease-in-out",
                                // On desktop, add left margin equal to sidebar width when open
                                isSidebarOpen ? "md:ml-64" : "md:ml-0",
                                isArtifactOpen ? "md:mr-96" : "md:mr-0",
                            ].join(" ")}
                        >
                            {/* Top bar with toggle button */}
                            <div className="sticky top-0 flex items-center gap-2 px-4 py-3 border-b border-neutral-800 bg-neutral-900">
                                <button
                                    onClick={toggleSidebar}
                                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-neutral-800"
                                    aria-label="Toggle sidebar"
                                >
                                    <BsLayoutSidebar className="text-xl" />
                                </button>
                                <button
                                    onClick={() => toggleArtifact('chart')}
                                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-neutral-800"
                                    aria-label="Toggle artifact viewer"
                                >
                                    <BsAsterisk className="text-xl" />
                                </button>
                                <ChatName />
                                {/* Optional: other header controls */}
                            </div>

                            {/* Page content */}
                            <main className="p-4 overflow-y-auto flex-1">
                                {/* ... content ... */}
                                {/* <div className="text-sm text-neutral-300">Start chatting</div> */}
                                <ChatRoom />

                            </main>
                            <ChatInput />
                        </div>
                        {/* Artifact Viewer */}
                        <Artifact
                            isOpen={isArtifactOpen}
                            onClose={() => setIsArtifactOpen(false)}
                            type={selectedArtifactType}
                            data={artifactData}
                            title={artifactData?.title}
                        />
                    </div>
                </ArtifactContext.Provider>
            </ChatProvider>
        </UserProvider>
    );
}
