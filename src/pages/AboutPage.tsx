import { useEffect, useState } from 'react';
import {
  BookOpen, Code2, Database,
  Github, Globe, Heart, Instagram, Layers,
  Linkedin, Mail, MapPin, Phone, Rocket, Server, Sparkles,
  Target, TrendingUp, Trophy, Zap
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="orb w-72 h-72 bg-sage-400/25 -top-10 right-10" />
        <div className="orb w-96 h-96 bg-cream-400/15 bottom-0 left-1/4" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className={`lg:col-span-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" /> Founder & Developer
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-sage-900 mb-4 leading-tight">
                Panga <span className="text-gradient">Yashwant</span>
              </h1>
              <p className="text-2xl text-dark-600 font-bold mb-4">Full-Stack Developer & Entrepreneur</p>
              <p className="text-dark-500 text-lg leading-relaxed mb-8 font-medium max-w-xl">
                The visionary behind Festivo — on a mission to transform how India celebrates.
                Combining technical expertise with a passion for creating memorable experiences.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <a href="mailto:hello@festivo.in" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-105 transition-all duration-300">
                  <Mail className="w-4 h-4" /> Get in Touch
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-sage-300 text-sage-700 font-bold rounded-xl hover:bg-sage-50 hover:border-sage-500 transition-all duration-200">
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-sage-300 text-sage-700 font-bold rounded-xl hover:bg-sage-50 hover:border-sage-500 transition-all duration-200">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md">
                {[
                  { value: '5+', label: 'Years Coding' },
                  { value: '10+', label: 'Projects Built' },
                  { value: '1', label: 'Mission: Festivo' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-sage-100 shadow-soft">
                    <p className="font-display text-2xl font-bold text-sage-700">{value}</p>
                    <p className="text-dark-500 text-xs font-bold mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`lg:col-span-2 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="relative mx-auto w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-brand blur-[60px] opacity-25 rounded-[2rem]" />
                <div className="relative bg-gradient-brand rounded-[2rem] p-1.5 shadow-card-hover">
                  <div className="bg-cream-50 rounded-[1.75rem] p-8">
                    <div className="relative">
                      <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-sage-400 to-sage-700 flex items-center justify-center mb-6 ring-8 ring-sage-100">
                        <span className="font-display text-7xl font-bold text-white">PY</span>
                      </div>
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center shadow-soft animate-float">
                        <Trophy className="w-6 h-6 text-cream-600" />
                      </div>
                      <div className="absolute bottom-16 left-0 w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center shadow-soft animate-float" style={{ animationDelay: '1s' }}>
                        <Code2 className="w-6 h-6 text-sage-600" />
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-sage-900 text-center mb-1">Panga Yashwant</h3>
                    <p className="text-dark-500 text-sm text-center font-medium mb-4">Founder, Festivo</p>
                    <div className="flex justify-center gap-2">
                      {['React', 'TypeScript', 'Supabase'].map(tech => (
                        <span key={tech} className="text-xs font-bold bg-sage-100 text-sage-700 px-2.5 py-1 rounded-full">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <VisionMission />
      {/* SKILLS */}
      <Skills />
      {/* JOURNEY */}
      <Journey />
      {/* TECH STACK */}
      <TechStack />
      {/* CONTACT */}
      <Contact />
      <Footer />
    </div>
  );
}

/* ── Vision & Mission ────────────────────────────── */
function VisionMission() {
  const { ref, inView } = useInView();
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Target, title: 'Vision',
              text: 'To become India\'s most trusted and widely-used event management platform — empowering every celebration, from intimate gatherings to grand weddings, with transparency, quality, and effortless booking.',
              color: 'from-sage-500 to-sage-700', bg: 'bg-sage-50', border: 'border-sage-200'
            },
            {
              icon: Rocket, title: 'Mission',
              text: 'To bridge the gap between customers and event vendors through technology. Providing a unified, verified, and user-friendly platform where every event is planned with confidence and executed flawlessly.',
              color: 'from-cream-500 to-cream-700', bg: 'bg-cream-50', border: 'border-cream-200'
            },
          ].map(({ icon: Icon, title, text, color, bg, border }, i) => (
            <div key={title} className={`${bg} ${border} border-2 rounded-3xl p-8 animate-on-scroll ${inView ? 'in-view' : ''} delay-${(i + 1) * 100}`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-glow`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-sage-900 mb-3">{title}</h2>
              <p className="text-dark-600 leading-relaxed font-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Skills ──────────────────────────────────────── */
function Skills() {
  const { ref, inView } = useInView();
  const skills = [
    { name: 'React & TypeScript', level: 95, icon: Code2 },
    { name: 'UI/UX Design', level: 88, icon: Layers },
    { name: 'Backend & Databases', level: 85, icon: Database },
    { name: 'Tailwind CSS', level: 92, icon: Zap },
  ];
  return (
    <section className="py-20 bg-cream-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 animate-on-scroll ${inView ? 'in-view' : ''}`}>
          <span className="text-sage-600 text-sm font-bold tracking-widest uppercase mb-2 block">Core Competencies</span>
          <h2 className="font-display text-4xl font-bold text-sage-900">Skills & <span className="text-gradient">Expertise</span></h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {skills.map(({ name, level, icon: Icon }, i) => (
            <div key={name} className={`bg-white rounded-2xl p-6 border border-sage-100 shadow-soft animate-on-scroll ${inView ? 'in-view' : ''} delay-${(i + 1) * 100}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center"><Icon className="w-5 h-5 text-sage-600" /></div>
                  <span className="font-bold text-sage-900">{name}</span>
                </div>
                <span className="font-bold text-sage-600 text-sm">{level}%</span>
              </div>
              <div className="h-2.5 bg-sage-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand rounded-full transition-all duration-1000 ease-out"
                  style={{ width: inView ? `${level}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Journey ─────────────────────────────────────── */
function Journey() {
  const { ref, inView } = useInView();
  const milestones = [
    { year: '2021', title: 'Started Coding Journey', desc: 'Began learning web development with HTML, CSS, and JavaScript. Fell in love with building things for the web.', icon: BookOpen },
    { year: '2022', title: 'Mastered React & TypeScript', desc: 'Dived deep into modern frontend development. Built multiple projects and gained expertise in component-based architecture.', icon: Code2 },
    { year: '2023', title: 'Explored Backend & Databases', desc: 'Expanded into full-stack development. Learned PostgreSQL, Supabase, and API design. Started thinking about product ideas.', icon: Server },
    { year: '2024', title: 'The Festivo Idea', desc: 'Identified the gap in India\'s event planning industry. Began designing and architecting a unified vendor marketplace.', icon: Rocket },
    { year: '2025', title: 'Festivo Launched', desc: 'Built and deployed Festivo — a complete event management platform with 2,500+ vendors, secure bookings, and a beautiful UI.', icon: Trophy },
    { year: '2026', title: 'Scaling & Beyond', desc: 'Continuing to improve Festivo with new features, expanding to more cities, and helping more people celebrate perfectly.', icon: TrendingUp },
  ];
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 animate-on-scroll ${inView ? 'in-view' : ''}`}>
          <span className="text-sage-600 text-sm font-bold tracking-widest uppercase mb-2 block">The Road So Far</span>
          <h2 className="font-display text-4xl font-bold text-sage-900">My <span className="text-gradient">Journey</span></h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-sage-200" />
          {milestones.map(({ year, title, desc, icon: Icon }, i) => (
            <div key={year} className={`relative flex gap-6 mb-10 animate-on-scroll ${inView ? 'in-view' : ''} delay-${(i % 3 + 1) * 100} ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="hidden md:block flex-1" />
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow z-10 flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 pl-16 md:pl-0 md:pr-8">
                <div className="bg-cream-50 rounded-2xl p-5 border border-sage-100 shadow-soft card-hover">
                  <span className="text-xs font-bold text-sage-600 bg-sage-100 px-2.5 py-1 rounded-full">{year}</span>
                  <h3 className="font-display text-lg font-bold text-sage-900 mt-3 mb-2">{title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Tech Stack ──────────────────────────────────── */
function TechStack() {
  const { ref, inView } = useInView();
  const stack = [
    { name: 'React 18', role: 'UI Framework', icon: Code2 },
    { name: 'TypeScript', role: 'Type Safety', icon: Layers },
    { name: 'Vite', role: 'Build Tool', icon: Zap },
    { name: 'Tailwind CSS', role: 'Styling', icon: Layers },
    { name: 'Supabase', role: 'Database & Auth', icon: Database },
    { name: 'PostgreSQL', role: 'Database Engine', icon: Server },
    { name: 'React Router', role: 'Navigation', icon: Server },
    { name: 'Lucide Icons', role: 'Icon System', icon: Sparkles },
  ];
  return (
    <section className="py-20 bg-cream-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 animate-on-scroll ${inView ? 'in-view' : ''}`}>
          <span className="text-sage-600 text-sm font-bold tracking-widest uppercase mb-2 block">Tools of the Trade</span>
          <h2 className="font-display text-4xl font-bold text-sage-900">Technology <span className="text-gradient">Stack</span></h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stack.map(({ name, role, icon: Icon }, i) => (
            <div key={name} className={`bg-white rounded-2xl p-6 text-center border border-sage-100 shadow-soft card-hover animate-on-scroll-scale ${inView ? 'in-view' : ''} delay-${(i % 4 + 1) * 100}`}>
              <div className="w-12 h-12 mx-auto rounded-xl bg-sage-100 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-sage-600" />
              </div>
              <p className="font-bold text-sage-900 text-sm">{name}</p>
              <p className="text-dark-500 text-xs font-medium mt-1">{role}</p>
            </div>
  ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ─────────────────────────────────────── */
function Contact() {
  const { ref, inView } = useInView();
  const contacts = [
    { icon: Mail, label: 'Email', value: 'hello@festivo.in', href: 'mailto:hello@festivo.in' },
    { icon: Phone, label: 'Phone', value: '+91 62810 37993', href: 'tel:+916281037993' },
    { icon: MapPin, label: 'Location', value: 'Mumbai, Maharashtra, India', href: null },
  ];
  const socials = [
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: Github, label: 'GitHub', href: 'https://github.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Globe, label: 'Website', href: '#' },
  ];
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 animate-on-scroll ${inView ? 'in-view' : ''}`}>
          <span className="text-sage-600 text-sm font-bold tracking-widest uppercase mb-2 block">Get in Touch</span>
          <h2 className="font-display text-4xl font-bold text-sage-900">Let's <span className="text-gradient">Connect</span></h2>
          <p className="text-dark-500 mt-3 font-medium">Have a question or want to collaborate? Reach out!</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {contacts.map(({ icon: Icon, label, value, href }, i) => (
            <div key={label} className={`bg-cream-50 rounded-2xl p-6 text-center border border-sage-100 shadow-soft animate-on-scroll ${inView ? 'in-view' : ''} delay-${(i + 1) * 100}`}>
              <div className="w-12 h-12 mx-auto rounded-xl bg-sage-100 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-sage-600" />
              </div>
              <p className="text-sage-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
              {href ? <a href={href} className="text-sage-900 font-bold text-sm hover:text-sage-600 transition-colors">{value}</a> : <p className="text-sage-900 font-bold text-sm">{value}</p>}
            </div>
          ))}
        </div>
        <div className={`flex justify-center gap-3 animate-on-scroll ${inView ? 'in-view' : ''} delay-400`}>
          {socials.map(({ icon: Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
              className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600 hover:bg-gradient-brand hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-glow">
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
        <div className={`text-center mt-12 animate-on-scroll ${inView ? 'in-view' : ''} delay-500`}>
          <div className="inline-flex items-center gap-2 bg-sage-50 border border-sage-200 rounded-full px-6 py-3">
            <Heart className="w-4 h-4 text-sage-600" />
            <span className="text-sage-800 font-bold text-sm">Designed & Developed by Panga Yashwant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
