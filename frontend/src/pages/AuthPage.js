// src/pages/AuthPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Layers, Cpu } from 'lucide-react';

// ================================================================
// THE FIX: The erroneous </p> tag has been replaced with </path>.
// ================================================================
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.52C34.337 7.747 29.508 5.5 24 5.5C11.91 5.5 2 15.41 2 27.5S11.91 49.5 24 49.5c12.09 0 22-9.91 22-22c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c3.12-3.12 7.22-4.991 11.694-4.991c2.81 0 5.48.868 7.74 2.443l-4.22 4.22c-1.42-1.11-3.13-1.74-4.98-1.74-3.52 0-6.62 1.95-8.2 4.89l-4.5-3.82z"></path>
    <path fill="#4CAF50" d="M24 49.5c5.58 0 10.42-2.12 13.91-5.6l-4.33-4.33c-2.13 1.63-4.79 2.59-7.58 2.59c-4.44 0-8.29-2.22-10.29-5.58l-4.69 3.89c2.97 5.75 8.79 9.62 15.5 9.62z"></path>
    <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-1.786 0-3.483-.4-4.982-1.075l-4.545 3.84c2.587 1.48 5.618 2.305 8.847 2.305C35.091 41.5 44 32.591 44 20.5c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);


const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    const toggleView = () => setIsLoginView(!isLoginView);

    return (
        <div className="min-h-screen w-full font-sans text-white bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Image & Overlay */}
            <div 
                className="absolute inset-0 z-0 kenburns-background"
                style={{ 
                    backgroundImage: "url('/datacentre-background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }} 
            />
            <div className="absolute inset-0 z-1 bg-gradient-to-br from-dark-bg via-dark-bg/80 to-blue-900/60" />
            
            {/* Auth Card */}
            <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 glassmorphism-card rounded-2xl border-dark-border/50 overflow-hidden fade-in-up">
                
                {/* == LEFT PANEL: THE FORM == */}
                <div className="p-8 md:p-12">
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 mb-4 animate-fade-in-subtle" style={{animationDelay: '0.1s'}} />
                    <h2 className="text-3xl font-bold mb-2 animate-fade-in-subtle" style={{animationDelay: '0.2s'}}>
                        {isLoginView ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-dark-text-secondary mb-8 animate-fade-in-subtle" style={{animationDelay: '0.3s'}}>
                        {isLoginView ? 'Sign in to access your security dashboard.' : 'Get started with real-time network intelligence.'}
                    </p>

                    {/* Google Auth Button */}
                    <button className="w-full flex items-center justify-center gap-3 p-3 mb-6 bg-white text-gray-800 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in-subtle" style={{animationDelay: '0.4s'}}>
                        <GoogleIcon />
                        Sign {isLoginView ? 'in' : 'up'} with Google
                    </button>
                    
                    <div className="flex items-center my-6 animate-fade-in-subtle" style={{animationDelay: '0.5s'}}>
                        <hr className="w-full border-dark-border/50" />
                        <span className="px-4 text-dark-text-secondary text-sm">OR</span>
                        <hr className="w-full border-dark-border/50" />
                    </div>

                    {/* Form Inputs */}
                    <form className="space-y-6">
                        <div className="animate-fade-in-subtle" style={{animationDelay: '0.6s'}}>
                            <label className="text-sm font-semibold text-dark-text-secondary">Email</label>
                            <div className="relative flex items-center mt-2">
                                <Mail className="absolute left-3 text-dark-text-secondary" size={20} />
                                <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-dark-border/50 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition-all duration-300"/>
                            </div>
                        </div>
                        <div className="animate-fade-in-subtle" style={{animationDelay: '0.7s'}}>
                            <label className="text-sm font-semibold text-dark-text-secondary">Password</label>
                            <div className="relative flex items-center mt-2">
                                <Lock className="absolute left-3 text-dark-text-secondary" size={20} />
                                <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-dark-border/50 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition-all duration-300"/>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="w-full p-3 font-bald bg-accent-primary text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-accent-secondary shadow-lg hover:shadow-accent-primary/30 animate-fade-in-subtle" style={{animationDelay: '0.8s'}}>
                           {isLoginView ? 'Login' : 'Create Account'}
                        </button>
                    </form>

                    {/* Toggle View */}
                    <p className="text-center text-sm text-dark-text-secondary mt-8 animate-fade-in-subtle" style={{animationDelay: '0.9s'}}>
                        {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                        <button onClick={toggleView} className="font-bold text-accent-primary hover:underline ml-2">
                            {isLoginView ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
                
                {/* == RIGHT PANEL: THE INFOGRAPHIC == */}
                <div className="hidden md:flex flex-col items-center justify-center p-12 bg-dark-bg/20 relative">
                    <div className="absolute inset-0 z-0">
                        {/* Abstract rotating rings infographic */}
                        <div className="absolute inset-0 animate-orbit-reverse-1">
                            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-accent-primary/20 rounded-full" />
                        </div>
                         <div className="absolute inset-0 animate-orbit-reverse-2">
                            <div className="absolute top-[10%] left-[10%] w-4/5 h-4/5 border border-accent-primary/20 rounded-full" />
                        </div>
                    </div>
                    
                    <div className="relative text-center z-10 animate-fade-in-subtle" style={{animationDelay: '0.5s'}}>
                       <div className="w-24 h-24 mb-6 mx-auto bg-dark-bg/50 border border-accent-primary/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                           <ShieldCheck size={48} className="text-accent-primary" />
                       </div>
                       <h3 className="text-2xl font-bold mb-2">Total Security Visibility</h3>
                       <p className="text-dark-text-secondary max-w-xs">Access a unified dashboard to monitor threats, analyze traffic, and ensure network integrity.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;