import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/common/Icon";
import { HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const AuthLanding = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleGoogleLogin = () => {
        // Mock login
        login({
            id: "user-123",
            name: "Admin User",
            email: "admin@greetcard.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
        });
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center space-y-8 animate-in zoom-in-95 duration-300">

                {/* Branding */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Icon icon={HeartHandshake} className="text-white" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">GreetCard</h1>
                    <p className="text-gray-500">Enterprise Greeting Card Management</p>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-4">
                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 h-12 text-base shadow-sm relative"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 absolute left-4" alt="Google" />
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with email</span></div>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGoogleLogin(); }}>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-700">Email address</label>
                            <input type="email" placeholder="name@company.com" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" />
                        </div>
                        <Button type="submit" variant="cta" className="w-full h-12 text-base">
                            Sign In
                        </Button>
                    </form>
                </div>

                <p className="text-xs text-center text-gray-400">
                    By clicking continue, you agree to our <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
                </p>
            </div>
            <p className="text-gray-400 text-sm mt-8">&copy; 2024 GreetCard Inc.</p>
        </div>
    );
};

export default AuthLanding;
