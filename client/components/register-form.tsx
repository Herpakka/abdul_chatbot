const RegisterForm = ({ onSubmit }: any) => {
    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <div className="bg-neutral-800 border border-neutral-700 p-8 rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">ABDUL Chatbot</h1>
                    <h2 className="text-xl font-semibold text-neutral-300 mb-1">Create Account</h2>
                    <p className="text-sm text-neutral-400">Join us and start your AI conversations</p>
                </div>

                {/* Register Form */}
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                            Email Address
                        </label>
                        <input 
                            className="w-full bg-neutral-700 border border-neutral-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-neutral-400 hover:border-neutral-500" 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="Enter your email address"
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                            Username
                        </label>
                        <input 
                            className="w-full bg-neutral-700 border border-neutral-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-neutral-400 hover:border-neutral-500" 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Choose a username"
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                            Password
                        </label>
                        <input 
                            className="w-full bg-neutral-700 border border-neutral-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-neutral-400 hover:border-neutral-500" 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Create a strong password"
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                            Confirm Password
                        </label>
                        <input 
                            className="w-full bg-neutral-700 border border-neutral-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-neutral-400 hover:border-neutral-500" 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            placeholder="Confirm your password"
                            required 
                        />
                    </div>

                    <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transform hover:-translate-y-0.5" 
                        type="submit"
                    >
                        Create Account
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="border-t border-neutral-600 flex-grow"></div>
                        <span className="px-3 text-xs text-neutral-500">OR</span>
                        <div className="border-t border-neutral-600 flex-grow"></div>
                    </div>

                    <p className="text-sm text-neutral-400">
                        Already have an account? {' '}
                        <a 
                            href="/auth/login" 
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline"
                        >
                            Sign in here
                        </a>
                    </p>
                </div>

                {/* Additional Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-neutral-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterForm;