import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import TocDialog from '@/components/ui/terms-conditions'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [agreeTerms, setAgreeTerms] = useState(false)

    const { loading, handleRegister } = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!agreeTerms) {
            alert("Please accept the Terms & Conditions to proceed.")
            return
        }
        await handleRegister({ username, email, password })
        navigate("/dashboard")
    }

    if (loading) {
        return (
            <main className="flex min-h-screen w-full items-center justify-center bg-[#09090b] px-4">
                <div className="form-container flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <h1 className="text-base font-medium text-white">Creating account...</h1>
                    <p className="text-xs text-[#71717a] text-center max-w-[260px] leading-relaxed">
                        Waking up the server — this may take up to 30s on the first visit.
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
                        <h1>Create an account</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details to sign up for Interview AI.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text"
                            id="username"
                            name='username'
                            placeholder='Enter username'
                            required
                        />
                    </div>
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
                            placeholder='Choose a strong password'
                            required
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1 text-left">
                        <div className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Checkbox 
                                id="terms" 
                                checked={agreeTerms} 
                                onCheckedChange={(checked) => setAgreeTerms(!!checked)} 
                            />
                            <div className="text-sm text-[#a1a1aa] flex items-center gap-1.5 flex-wrap">
                                <span>I agree to the</span>
                                <TocDialog />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={!agreeTerms} className="w-full font-semibold py-5 mt-2">
                        Get Started
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account? <Link to={"/login"} className="text-white font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default Register