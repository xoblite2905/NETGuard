// src/pages/WelcomePage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, Binary, GitBranch, Cpu, Layers, LocateFixed, ScanLine, 
    Github, Mail, Linkedin 
} from 'lucide-react';

// ================================================================
// NEW COMPONENT: AnimatedText for character/word reveal animations
// This is the core of the new creative text effects.
// ================================================================
const AnimatedText = ({ text, delay = 0, word_delay = 0.08 }) => {
    return (
        <span className="animate-text-reveal inline-block">
            {text.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block" style={{ animationDelay: `${delay + wordIndex * word_delay}s`}}>
                    {word.split('').map((char, charIndex) => (
                        <span key={charIndex} className="inline-block" style={{ animationDelay: `${delay + (wordIndex * word_delay) + (charIndex * 0.02)}s`}}>
                            {char}
                        </span>
                    ))}
                    {wordIndex < text.split(' ').length - 1 ? '\u00A0' : ''}
                </span>
            ))}
        </span>
    );
};


// Reusable Component: FeatureCard (Enhanced with hover glow)
const FeatureCard = ({ icon, title, description, delay }) => (
    <div 
        className="glassmorphism-card p-6 rounded-2xl border border-dark-border/50 overflow-hidden
                   transition-all duration-500 hover:border-accent-primary/50 hover:shadow-2xl 
                   hover:shadow-accent-primary/20 hover:-translate-y-2 fade-in-up group"
        style={{ animationDelay: delay }}
    >
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent-primary/20 text-accent-primary mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-accent-primary/30">{icon}</div>
        <h3 className="text-lg font-semibold text-dark-text mb-2 transition-colors duration-300 group-hover:text-white">{title}</h3>
        <p className="text-sm text-dark-text-secondary transition-colors duration-300 group-hover:text-gray-300">{description}</p>
    </div>
);

// Reusable Component: OrbitingNode (No changes)
const OrbitingNode = ({ icon, duration, position }) => {
    const animationClass = duration.includes('s') && parseInt(duration) > 15 ? 'animate-[orbit-1]' : 'animate-[orbit-2]';
    return (
        <div className={`absolute inset-0 ${animationClass}`} style={{ animationDuration: duration }}>
            <div className={`absolute ${position} flex items-center justify-center`}>
                <div className="w-16 h-16 flex items-center justify-center text-accent-primary/80
                                bg-dark-bg/50 rounded-full border border-dark-border/50 backdrop-blur-sm group-hover:border-accent-primary/50 transition-all duration-500">
                    {icon}
                </div>
            </div>
        </div>
    );
};


const WelcomePage = () => {
    const [scrolled, setScrolled] = useState(false);

    // ================================================================
    // PRO IMPLEMENTATION: Effect Hook for the 'disappearing' header
    // Adds a scroll listener to toggle header style for a modern UI.
    // ================================================================
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <main className="bg-dark-bg text-dark-text font-sans">
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-bg/70 backdrop-blur-lg border-b border-dark-border/30 shadow-2xl' : 'bg-transparent'}`}>
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/welcome" className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Cybreon Logo" className="h-10 w-10 transition-transform duration-500 hover:rotate-12" />
                        <span className="text-xl font-bold text-white tracking-wider"><AnimatedText text="Cybreon" /></span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-dark-text-secondary hover:text-white transition-colors duration-300">Features</a>
                        <a href="#about" className="text-dark-text-secondary hover:text-white transition-colors duration-300">About</a>
                    </nav>
                    <Link to="/login" className="hidden md:inline-block px-6 py-2 rounded-full font-semibold bg-accent-primary text-white text-center transition-all duration-300 transform hover:scale-105 hover:bg-accent-secondary shadow-lg hover:shadow-accent-primary/30">
                        Go to Dashboard
                    </Link>
                </div>
            </header>

            {/* VISUAL ZONE 1: THE DATA CENTER (SCALE & COMPLEXITY) */}
            <div className="relative h-screen overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 kenburns-background" style={{ backgroundImage: "url('/server-technician.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
                </div>
                <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col items-start text-left">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 text-shadow-accent">
                            <AnimatedText text="Clarity in Complexity." />
                        </h1>
                        <p className="text-lg text-dark-text-secondary max-w-lg mb-8">
                           <AnimatedText text="Cybreon transforms chaotic network traffic into a clear, actionable intelligence dashboard." delay={0.8} />
                        </p>
                    </div>
                    <div className="relative flex items-center justify-center h-96 md:h-[500px] group animate-fade-in-subtle" style={{animationDelay: '1s'}}>
                        <OrbitingNode icon={<Binary size={28} />} duration="20s" position="top-0 left-1/4" />
                        <OrbitingNode icon={<GitBranch size={32} />} duration="15s" position="bottom-0 right-1/4" />
                        <OrbitingNode icon={<Cpu size={30} />} duration="25s" position="top-1/4 right-0" />
                        <OrbitingNode icon={<ShieldCheck size={28} />} duration="18s" position="bottom-1/4 left-0" />
                        <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                           <img src="/logo.png" alt="Cybreon Logo" className="w-40 h-40 animate-pulse" style={{animationDuration: '6s'}} />
                        </div>
                    </div>
                </div>
            </div>

            {/* VISUAL ZONE 2: THE TECHNICIAN (CONTROL & EXPERTISE) */}
            <div className="relative overflow-hidden bg-dark-bg">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute inset-0" style={{ backgroundImage: "url('/cyber-security-typing.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 70%', backgroundAttachment: 'fixed' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-blue-900/50 to-dark-bg" />
                </div>
                <div className="relative z-10">
                    <section id="features" className="container mx-auto px-6 py-24">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold tracking-tight text-white"><AnimatedText text="Core Platform Features" /></h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon={<Layers size={28}/>} title="Live Packet Analysis" description="Monitor dataflow in real-time, spotting anomalies as they happen." delay="0.2s" />
                            <FeatureCard icon={<LocateFixed size={28}/>} title="Threat Intelligence" description="Flag connections to malicious IPs with integrated threat feeds." delay="0.4s" />
                            <FeatureCard icon={<ScanLine size={28}/>} title="Vulnerability Scanning" description="Discover host vulnerabilities and open ports before they are exploited." delay="0.6s" />
                        </div>
                    </section>
                    <section id="about" className="container mx-auto px-6 py-24 text-center">
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-4"><AnimatedText text="About The Project" delay={0.2} /></h2>
                        <p className="max-w-3xl mx-auto text-lg text-dark-text-secondary"><AnimatedText text="Cybreon is a high-fidelity SIEM powered by a FastAPI & Python backend and a React frontend. It leverages Zeek for deep packet inspection to provide stunning, real-time visualizations." delay={0.6} /></p>
                    </section>
                </div>
            </div>

            {/* PROFESSIONAL FOOTER */}
            <footer className="relative z-10 bg-dark-bg/80 backdrop-blur-sm border-t border-dark-border/50">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start space-y-4 fade-in-up">
                           <div className="flex items-center space-x-3"><img src="/logo.png" alt="Cybreon Logo" className="h-10 w-10" /><span className="text-xl font-bold text-white">Cybreon</span></div>
                           <p className="text-sm max-w-xs text-dark-text-secondary">An open-source network intelligence platform.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start space-y-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <h3 className="font-semibold text-white">Connect With Us</h3>
                            <div className="flex space-x-6"><a href="#" className="text-dark-text-secondary hover:text-accent-primary transition-all duration-300 hover:-translate-y-1"><Github size={24} /></a><a href="#" className="text-dark-text-secondary hover:text-accent-primary transition-all duration-300 hover:-translate-y-1"><Linkedin size={24} /></a><a href="#" className="text-dark-text-secondary hover:text-accent-primary transition-all duration-300 hover:-translate-y-1"><Mail size={24} /></a></div>
                        </div>
                        <div className="flex flex-col items-center md:items-start space-y-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <h3 className="font-semibold text-white">Navigate</h3>
                            <a href="#features" className="text-dark-text-secondary hover:text-white transition-colors">Features</a><a href="#about" className="text-dark-text-secondary hover:text-white transition-colors">About</a>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-dark-border/50 pt-8 text-center text-sm text-dark-text-secondary fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <p>© {new Date().getFullYear()} Cybreon. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
};

export default WelcomePage;