import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/dashboard')
    }

    if (loading) {
        return (
            <main className="flex min-h-screen w-full items-center justify-center bg-[#09090b] px-4">
                <div className="form-container flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <h1 className="text-base font-medium text-white">Logging in...</h1>
                    <p className="text-xs text-[#71717a] text-center max-w-[260px] leading-relaxed">
                        Authenticating your credentials, please wait.
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-[#09090b] px-4">
            <div className="form-container">
                <button className="close-card-btn" aria-label="Close dialog" onClick={() => navigate('/')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="logo-badge" aria-hidden="true">i</div>
                    <div className="text-center space-y-1">
                        <h1>Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to login to your account.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='subha9.5roy350@gmail.com'
                            required
                        />
                    </div>
                    <div className="space-y-1.5 text-left">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='Enter your password'
                            required
                        />
                    </div>
                    
                    <div className="auth-options-row">
                        <div className="checkbox-container">
                            <Checkbox 
                                id="remember" 
                                checked={rememberMe} 
                                onCheckedChange={(checked) => setRememberMe(!!checked)} 
                            />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>
                        <button type="button" className="forgot-link">
                            Forgot password?
                        </button>
                    </div>

                    <Button type="submit" className="w-full font-semibold py-5 mt-2">
                        Sign in
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account? <Link to={"/register"} className="text-white font-semibold hover:underline">Register</Link>
                </p>
            </div>
        </main>
    )
}

export default Login