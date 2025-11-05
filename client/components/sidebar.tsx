import { useRef, useEffect, useState } from 'react';
import { useUser } from "@/contexts/user.context";
import { useChat } from "@/contexts/chat.context";
import { BsBoxArrowRight, BsPerson, BsPlus, BsThreeDots, BsCheck, BsX } from "react-icons/bs";
import type { Chat } from "@/contexts/chat.context";
import Swal from 'sweetalert2';

type SideBarProps = {
    isOpen: boolean;
    onClose?: () => void;
};

export default function Sidebar({ isOpen, onClose }: SideBarProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const { chats, currentChat, setCurrentChat, deleteChat, renameChat } = useChat();
    const { user, updateUser, logout, validateOldPassword } = useUser();
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | undefined>(undefined);

    // chat menu
    const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const chatMenuRef = useRef<HTMLDivElement | null>(null);

    // user menu
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);

    // password validation states
    const [isValidatingPassword, setIsValidatingPassword] = useState(false);
    const [passwordValidated, setPasswordValidated] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleChatSelect = (chat: Chat) => {
        setSelectedChat(chat);
        setCurrentChat(chat);
    };

    const handleChatRename = (chatId: string, newTitle: string) => {
        // Placeholder for rename functionality
        Swal.fire({
            title: 'เปลี่ยนชื่อแชท',
            input: 'text',
            inputValue: newTitle,
            showCancelButton: true,
            theme: 'dark',
        }).then((result) => {
            if (result.isConfirmed) {
                const newName = result.value;
                renameChat && renameChat(chatId, newName);
            }
        });
        setShowChatMenu(null);
    };

    const handleChatDelete = (chatId: string) => {
        // SweetAlert with dark theme and custom styling
        Swal.fire({
            title: 'ต้องการลบแชทนี้หรือไม่?',
            text: "การลบแชทจะไม่สามารถกู้คืนได้!",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'bg-neutral-800 border border-neutral-700',
                title: 'text-white',
                htmlContainer: 'text-neutral-300',
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors',
                cancelButton: 'bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-md transition-colors ml-2'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                deleteChat && deleteChat(chatId);
                Swal.fire({
                    title: 'ลบแชทเรียบร้อยแล้ว',
                    icon: 'success',
                    theme: 'dark',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'bg-neutral-800 border border-neutral-700',
                        title: 'text-white',
                        htmlContainer: 'text-neutral-300'
                    }
                });
            }
        });
        setShowChatMenu(null);
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'ต้องการออกจากระบบหรือไม่?',
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonText: 'ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'bg-neutral-800 border border-neutral-700',
                title: 'text-white',
                htmlContainer: 'text-neutral-300',
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
            }
        });
    };

    const handleThreeDotsClick = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();

        if (showChatMenu === chatId) {
            setShowChatMenu(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            x: rect.right + 8,
            y: rect.top
        });
        setShowChatMenu(chatId);
    };

    const handleValidateOldPassword = async (oldPassword: string) => {
        setIsValidatingPassword(true);
        setPasswordError('');
        
        try {
            const isValid = await validateOldPassword?.(oldPassword);
            console.log("Password validation result:", isValid);
            if (isValid) {
                setPasswordValidated(true);
                setPasswordError('');
            } else {
                setPasswordError('Current password is incorrect');
            }
        } catch (error) {
            console.error("Error validating old password:", error);
            setPasswordError('Error validating password');
        } finally {
            setIsValidatingPassword(false);
        }
    };

    const updateUserProfile = async (username: string, newPassword: string | null) => {
        try {
            await updateUser?.(username, newPassword || '');
            return true;
        } catch (error) {
            console.error("Error updating user profile:", error);
            return false;
        }
    };

    const resetPasswordModal = () => {
        setPasswordValidated(false);
        setPasswordError('');
        setIsValidatingPassword(false);
    };

    const chatMenu = () => {
        if (!showChatMenu) return null;

        return (
            <div
                ref={chatMenuRef}
                className="fixed bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 z-50 min-w-24"
                style={{
                    left: menuPosition.x,
                    top: menuPosition.y
                }}
            >
                <button
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-neutral-700 transition-colors"
                    onClick={() => handleChatRename(showChatMenu, currentChat?.chatTitle || '')}
                >
                    Rename
                </button>
                <button
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-700 transition-colors"
                    onClick={() => handleChatDelete(showChatMenu)}
                >
                    Delete
                </button>
            </div>
        );
    };

    const userMenu = () => {
        if (!showUserMenu) return null;

        return (
            <div
                ref={userMenuRef}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => {
                    setShowUserMenu(false);
                    resetPasswordModal();
                }}
            >
                <div
                    className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1"
                        onClick={() => {
                            setShowUserMenu(false);
                            resetPasswordModal();
                        }}
                        aria-label="Close"
                    >
                        <BsX className="text-xl" />
                    </button>
                    
                    <h2 className="text-xl font-semibold mb-6 text-white">Edit Profile</h2>
                    
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const username = (form.elements.namedItem('username') as HTMLInputElement).value;
                            const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;

                            const success = await updateUserProfile(username, newPassword || null);
                            if (success) {
                                Swal.fire({
                                    title: 'Profile updated successfully!',
                                    icon: 'success',
                                    timer: 1500,
                                    showConfirmButton: false,
                                    background: '#171717',
                                    color: '#fff',
                                    customClass: {
                                        popup: 'border border-neutral-700'
                                    }
                                });
                                setShowUserMenu(false);
                                resetPasswordModal();
                            } else {
                                Swal.fire({
                                    title: 'Error updating profile',
                                    icon: 'error',
                                    timer: 1500,
                                    showConfirmButton: false,
                                    background: '#171717',
                                    color: '#fff',
                                    customClass: {
                                        popup: 'border border-neutral-700'
                                    }
                                });
                            }
                        }}
                        className="space-y-5"
                    >
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                defaultValue={user?.username || ""}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-800 text-white border border-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                required
                            />
                        </div>

                        <div className="border-t border-neutral-700 pt-5">
                            <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="oldPassword">
                                        Current Password
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="oldPassword"
                                            name="oldPassword"
                                            type="password"
                                            className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 text-white border border-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                                            disabled={passwordValidated}
                                        />
                                        {!passwordValidated && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const oldPasswordInput = document.getElementById('oldPassword') as HTMLInputElement;
                                                    if (oldPasswordInput?.value) {
                                                        handleValidateOldPassword(oldPasswordInput.value);
                                                    }
                                                }}
                                                disabled={isValidatingPassword}
                                                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                                            >
                                                {isValidatingPassword ? (
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <>
                                                        <BsCheck className="text-sm" />
                                                        Verify
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {passwordValidated && (
                                            <div className="px-4 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2">
                                                <BsCheck className="text-sm" />
                                                Verified
                                            </div>
                                        )}
                                    </div>
                                    {passwordError && (
                                        <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="newPassword">
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 text-white border border-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                                        disabled={!passwordValidated}
                                        placeholder={passwordValidated ? "Enter new password" : "Verify current password first"}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserMenu(false);
                                    resetPasswordModal();
                                }}
                                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
                setShowChatMenu(null);
            }
        };

        if (showChatMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showChatMenu]);

    useEffect(() => {
        setChatList(chats);
    }, [chats]);

    useEffect(() => {
        currentChat && handleChatSelect(currentChat)
    }, [currentChat])

    return (
        <>
            {/* Overlay for mobile when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden z-30 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={[
                    "fixed left-0 top-0 z-40 h-screen flex flex-col bg-neutral-900 text-white transition-all duration-300 ease-in-out",
                    "border-r border-neutral-800 w-64",
                    // Simple: hidden when closed, visible when open, on all screen sizes
                    isOpen ? "translate-x-0" : "-translate-x-full"
                ].join(" ")}
                ref={menuRef}
            >
                {/* Header section */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
                    <span className="p-2 text-sm font-semibold">ABDUL Chatbot</span>
                </div>

                {/* Main content area - takes remaining space */}
                <div className={`flex-1 ${showChatMenu ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <div className="p-3 space-y-2">
                        <button
                            className="w-full flex items-center gap-2 rounded-md px-3 py-2 bg-neutral-800 hover:bg-neutral-700"
                            onClick={() => {
                                setCurrentChat(undefined);
                                setSelectedChat(undefined);
                            }}
                        >
                            <BsPlus className="text-lg" />
                            <span className="text-sm">New chat</span>
                        </button>

                        {/* Chat list */}
                        {chatList.length > 0 && (
                            <>
                                <div className="text-xs text-neutral-400 px-1 mt-4">Recent</div>
                                <ul className="space-y-1">
                                    {chatList.map((chat) => (
                                        <li
                                            key={chat.id}
                                            className={[
                                                "px-3 py-2 rounded-md cursor-pointer text-sm flex items-center justify-between group",
                                                selectedChat?.id === chat.id
                                                    ? "bg-neutral-700 text-white"
                                                    : "hover:bg-neutral-800 text-neutral-300"
                                            ].join(" ")}
                                            onClick={() => handleChatSelect(chat)}
                                        >
                                            <span className="block truncate flex-1">{chat.chatTitle || "Untitled Chat"}</span>
                                            {selectedChat?.id === chat.id && (
                                                <button
                                                    className="ml-2 p-1 rounded hover:bg-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    onClick={(e) => handleThreeDotsClick(e, chat.id)}
                                                >
                                                    <BsThreeDots className="text-xs" />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                {/* User section at bottom */}
                <div className="flex-shrink-0 border-t border-neutral-800">
                    <div className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <button
                                    className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-neutral-600 transition-colors"
                                    onClick={() => setShowUserMenu(true)}
                                >
                                    <BsPerson className="text-sm text-neutral-300" />
                                </button>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white truncate">
                                        {user?.username || user?.email || "User"}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white flex-shrink-0"
                                aria-label="Logout"
                            >
                                <BsBoxArrowRight className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Chat menu */}
            {chatMenu()}

            {/* User profile modal */}
            {userMenu()}
        </>
    );
}