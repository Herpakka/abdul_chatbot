const LoginForm = ({onSubmit}: any) => {
    return (
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl shadow-2xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Welcome Back</h2>
            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <input 
                        className="w-full bg-gray-800 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400" 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Enter your email"
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                    </label>
                    <input 
                        className="w-full bg-gray-800 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400" 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Enter your password"
                        required 
                    />
                </div>
                <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900" 
                    type="submit"
                >
                    Sign In
                </button>
            </form>
            <div className="mt-6 text-center">
                <span className="text-gray-400">Don't have an account? </span>
                <a href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                    Create one here
                </a>
            </div>
        </div>
    );
}

export default LoginForm;