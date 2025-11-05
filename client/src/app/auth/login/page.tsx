"use client";

import { useRouter } from "next/navigation";
import Axios from "axios";
import Swal from "sweetalert2";
import LoginForm from "../../../../components/login-form";

const LoginPage = () => {
    const router = useRouter();

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const url = process.env.NEXT_PUBLIC_SERVER_URL || "";
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        Axios.post(`${url}/auth/login`, { email, password })
            .then((response) => {
                // Save access_token in cookie with expire date
                const token = response.data.access_token;
                let expires = "";
                if (response.data.expireAt) {
                    // Convert expireAt to UTC string if possible
                    const expireDate = new Date(response.data.expireAt);
                    if (!isNaN(expireDate.getTime())) {
                        expires = `; expires=${expireDate.toUTCString()}`;
                    }
                }
                document.cookie = `token=${token}${expires}; path=/`;

                // Success alert with dark theme
                Swal.fire({
                    title: 'Login Successful!',
                    text: 'Welcome back to ABDUL Chatbot',
                    icon: 'success',
                    theme: 'dark',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'bg-neutral-800 border border-neutral-700',
                        title: 'text-white',
                        htmlContainer: 'text-neutral-300'
                    }
                }).then(() => {
                    router.push("/chat");
                });
            })
            .catch((error) => {
                let message = "Login failed";
                if (error.response && error.response.data && error.response.data.message) {
                    if (Array.isArray(error.response.data.message)) {
                        message = error.response.data.message.join("\n");
                    } else {
                        message = error.response.data.message;
                    }
                }

                // Error alert with dark theme
                Swal.fire({
                    title: 'Login Failed',
                    text: message,
                    icon: 'error',
                    theme: 'dark',
                    confirmButtonText: 'Try Again',
                    customClass: {
                        popup: 'bg-neutral-800 border border-neutral-700',
                        title: 'text-white',
                        htmlContainer: 'text-neutral-300',
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors'
                    },
                    buttonsStyling: false
                });
            });
    };

    return (
        <div className="min-h-screen bg-neutral-900">
            <LoginForm onSubmit={handleLogin} />
        </div>
    );
};

export default LoginPage;