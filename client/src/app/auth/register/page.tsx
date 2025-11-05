"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "../../../../components/register-form";
import Axios from "axios";
import Swal from "sweetalert2";

const RegisterPage = () => {
    const router = useRouter();

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const url = process.env.NEXT_PUBLIC_SERVER_URL || "";
        console.log("Server URL:", url);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const username = formData.get("username");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        // Client-side password validation
        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Password Mismatch',
                text: 'Passwords do not match! Please try again.',
                icon: 'error',
                theme: 'dark',
                confirmButtonText: 'Try Again',
                customClass: {
                    popup: 'bg-neutral-800 border border-neutral-700',
                    title: 'text-white',
                    htmlContainer: 'text-neutral-300',
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors'
                },
                buttonsStyling: false
            });
            return;
        }

        Axios.post(`${url}/auth/register`, { email, username, password })
            .then(() => {
                // Success alert with dark theme
                Swal.fire({
                    title: 'Registration Successful!',
                    text: 'Welcome to ABDUL Chatbot! You can now sign in with your account.',
                    icon: 'success',
                    theme: 'dark',
                    confirmButtonText: 'Continue to Login',
                    customClass: {
                        popup: 'bg-neutral-800 border border-neutral-700',
                        title: 'text-white',
                        htmlContainer: 'text-neutral-300',
                        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors'
                    },
                    buttonsStyling: false
                }).then(() => {
                    router.push("/auth/login");
                });
            })
            .catch((error) => {
                let message = "Registration failed";
                if (error.response && error.response.data && error.response.data.message) {
                    if (Array.isArray(error.response.data.message)) {
                        message = error.response.data.message.join("\n");
                    } else {
                        message = error.response.data.message;
                    }
                }

                // Error alert with dark theme
                Swal.fire({
                    title: 'Registration Failed',
                    text: message,
                    icon: 'error',
                    theme: 'dark',
                    confirmButtonText: 'Try Again',
                    customClass: {
                        popup: 'bg-neutral-800 border border-neutral-700',
                        title: 'text-white',
                        htmlContainer: 'text-neutral-300',
                        confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors'
                    },
                    buttonsStyling: false
                });
            });
    };

    return (
        <div className="min-h-screen bg-neutral-900">
            <RegisterForm onSubmit={handleRegister} />
        </div>
    );
};

export default RegisterPage;