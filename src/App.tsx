import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Music, 
  Utensils, 
  Wine,
  ChevronDown,
  Info,
  Settings
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { SiteContent, defaultContent } from "./types";
import { AdminPanel } from "./components/AdminPanel";
import { AdminLoginModal } from "./components/AdminLoginModal";

const Ornament = ({ className = "" }: { className?: string }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`opacity-40 ${className}`}>
    <path d="M0 10C10 10 10 0 20 0C30 0 30 10 40 10C50 10 50 20 60 20" stroke="var(--color-imperial-gold)" strokeWidth="1"/>
    <circle cx="30" cy="10" r="2" fill="var(--color-imperial-gold)"/>
    <path d="M0 10C10 10 10 20 20 20C30 20 30 10 40 10C50 10 50 0 60 0" stroke="var(--color-imperial-gold)" strokeWidth="1"/>
  </svg>
);

const EditableText = ({ 
  value, 
  onChange, 
  canEdit, 
  className = "", 
  element = "span",
  multiline = false
}: { 
  value: string; 
  onChange: (val: string) => void; 
  canEdit: boolean; 
  className?: string; 
  element?: any;
  multiline?: boolean;
}) => {
  const Component = element;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newVal = e.currentTarget.innerText;
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  if (!canEdit) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <Component
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`${className} outline-none border-b border-imperial-gold/20 hover:border-imperial-gold focus:border-imperial-gold bg-imperial-gold/5 transition-colors cursor-text`}
    >
      {value}
    </Component>
  );
};

const CornerOrnament = ({ className = "" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`absolute ${className}`}>
    <path d="M0 1 L40 1 M1 0 L1 40" stroke="var(--color-imperial-gold)" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="1" cy="1" r="3" fill="var(--color-imperial-gold)"/>
  </svg>
);

const LoadingRings = () => (
  <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle
      cx="90"
      cy="100"
      r="45"
      stroke="var(--color-imperial-gold)"
      strokeWidth="1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
    />
    <motion.circle
      cx="150"
      cy="100"
      r="45"
      stroke="var(--color-imperial-gold)"
      strokeWidth="1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
    />
    <motion.path
      d="M100 100 Q120 70 140 100"
      stroke="var(--color-imperial-gold)"
      strokeWidth="0.5"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.3 }}
      transition={{ duration: 2, delay: 1.5 }}
    />
  </svg>
);

const Preloader = () => (
  <motion.div
    exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
    className="fixed inset-0 z-[100] bg-warm-cream flex flex-col items-center justify-center"
  >
    <LoadingRings />
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1.5 }}
      className="text-center mt-8 text-stone-900"
    >
      <h2 className="font-display text-4xl italic text-estate-green tracking-[0.1em] font-light">Дениса & Дарьи</h2>
      <div className="flex items-center justify-center gap-4 my-8">
        <div className="w-12 h-px bg-imperial-gold/30" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.6em] text-stone-400">Усадьба Херувимовых</p>
    </motion.div>
  </motion.div>
);

export default function App() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [previewContent, setPreviewContent] = useState<SiteContent>(defaultContent);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [yandexUser, setYandexUser] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState({
    name: "",
    attending: "yes",
    guests: "1",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch content from API on mount
  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdminLoggedIn(true);
    }

    // Load from URL parameters fallback (important for mobile/redirect-based OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const yandexUserParam = urlParams.get('yandex_user');
    let loadedUserParam = null;

    if (yandexUserParam) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(yandexUserParam));
        localStorage.setItem('yandexUser', JSON.stringify(decodedUser));
        loadedUserParam = decodedUser;
        
        // Clean URL from parameters so it looks neat
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.error("Failed to parse yandex_user from URL", e);
      }
    }

    // Load Yandex user from localStorage or parsed param
    const savedUser = localStorage.getItem('yandexUser');
    const user = loadedUserParam || (savedUser ? JSON.parse(savedUser) : null);
    if (user) {
      try {
        setYandexUser(user);
        
        // Also verify Yandex admin status against backend
        fetch('/api/admin/check-yandex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yandexId: user.id, email: user.default_email })
        })
        .then(res => res.json())
        .then(data => {
          if (data.isAdmin && data.token) {
            localStorage.setItem('adminToken', data.token);
            setIsAdminLoggedIn(true);
          }
        })
        .catch(err => console.error("Auto Yandex admin verification failed", err));

        const nameFromUser = user.real_name || user.display_name || user.first_name || user.login;
        setFormState(prev => ({
          ...prev,
          name: nameFromUser || prev.name
        }));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            const merged = { 
              ...defaultContent, 
              ...data,
              colors: { ...defaultContent.colors, ...(data.colors || {}) },
              schedule: Array.isArray(data.schedule) ? data.schedule : defaultContent.schedule,
              details: Array.isArray(data.details) ? data.details : defaultContent.details,
              heroStyle: { ...defaultContent.heroStyle, ...(data.heroStyle || {}) },
              storyStyle: { ...defaultContent.storyStyle, ...(data.storyStyle || {}) },
              detailsStyle: { ...defaultContent.detailsStyle, ...(data.detailsStyle || {}) }
            };
            setContent(merged);
            setPreviewContent(merged);
          }
        }
      } catch (err) {
        console.error("Failed to fetch content", err);
        const saved = localStorage.getItem('siteContent');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            const merged = { 
              ...defaultContent, 
              ...data,
              colors: { ...defaultContent.colors, ...(data.colors || {}) },
              schedule: Array.isArray(data.schedule) ? data.schedule : defaultContent.schedule,
              details: Array.isArray(data.details) ? data.details : defaultContent.details,
              heroStyle: { ...defaultContent.heroStyle, ...(data.heroStyle || {}) },
              storyStyle: { ...defaultContent.storyStyle, ...(data.storyStyle || {}) },
              detailsStyle: { ...defaultContent.detailsStyle, ...(data.detailsStyle || {}) }
            };
            setContent(merged);
            setPreviewContent(merged);
          } catch (e) {
            console.error("Failed to parse saved content", e);
          }
        }
      } finally {
        setIsContentLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Listen for OAuth messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin - either same origin or standard patterns
      if (
        event.origin !== window.location.origin && 
        !event.origin.endsWith('.run.app') && 
        !event.origin.includes('localhost') &&
        !event.origin.includes('dockhost.net')
      ) {
        console.warn("Message origin rejected:", event.origin);
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const user = event.data.user;
        console.log("LOGIN SUCCESS! Full Yandex user object:", user);
        setYandexUser(user);
        localStorage.setItem('yandexUser', JSON.stringify(user));
        setIsLoggingIn(false);
        
        const nameFromUser = user.real_name || user.display_name || user.first_name || user.login;
        console.log("Setting name to:", nameFromUser);
        
        setFormState(prev => ({
          ...prev,
          name: nameFromUser || prev.name
        }));

        // Verify with server if this Yandex account is admin or linked
        fetch('/api/admin/check-yandex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yandexId: user.id, email: user.default_email })
        })
        .then(res => res.json())
        .then(data => {
          if (data.isAdmin && data.token) {
            localStorage.setItem('adminToken', data.token);
            setIsAdminLoggedIn(true);
            setIsLoginModalOpen(false);
            setIsAdminOpen(true);
          }
        })
        .catch(err => console.error("Error checking Yandex admin status on message", err));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
    if (window.location.search.includes('admin=true') || isPathAdmin) {
      // Clean up the URL path and search to present a clean landing page while saving intent
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, '/');
      }
      
      const token = localStorage.getItem('adminToken');
      if (token) {
        setIsAdminOpen(true);
      } else {
        setIsLoginModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleYandexLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await fetch(`/api/auth/yandex/url?origin=${encodeURIComponent(window.location.origin)}`);
      const { url } = await res.json();
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      if (isMobile) {
        window.location.href = url;
      } else {
        const authWindow = window.open(url, 'yandex_oauth', 'width=600,height=700');
        if (!authWindow) {
          window.location.href = url;
        }
      }
    } catch (err) {
      console.error("Failed to initiate Yandex login", err);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setYandexUser(null);
    localStorage.removeItem('yandexUser');
    setFormState(prev => ({ ...prev, name: "" }));
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
  };

  const handleCommitContent = async (newContent: SiteContent) => {
    setContent(newContent);
    setPreviewContent(newContent);
    
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/content', {
        method: 'POST',
        headers,
        body: JSON.stringify(newContent)
      });
      localStorage.setItem('siteContent', JSON.stringify(newContent));
    } catch (err) {
      console.error("Failed to save content to server", err);
    }
  };

  const handlePreviewUpdate = (newContent: SiteContent) => {
    setPreviewContent(newContent);
  };

  const handleCancelChanges = () => {
    setPreviewContent(content);
    setIsAdminOpen(false);
  };
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const displayContent = isAdminOpen ? previewContent : content;
  const hasChanges = JSON.stringify(content) !== JSON.stringify(previewContent);

  useEffect(() => {
    const root = document.documentElement;
    const colors = displayContent?.colors || defaultContent.colors;
    
    root.style.setProperty('--color-imperial-gold', colors.primary || defaultContent.colors.primary);
    root.style.setProperty('--color-warm-cream', colors.bg || defaultContent.colors.bg);
    root.style.setProperty('--color-estate-green', colors.text || defaultContent.colors.text);
    root.style.setProperty('--color-hover-accent', colors.hover || defaultContent.colors.hover);
    root.style.setProperty('--color-quote-bg', colors.quoteBg || defaultContent.colors.quoteBg);
  }, [displayContent?.colors]);

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yandexUser) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          yandexId: yandexUser.id,
          yandexEmail: yandexUser.default_email,
          yandexLogin: yandexUser.login,
          avatarUrl: `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`
        })
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit RSVP", err);
      alert("Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const names = displayContent?.names || defaultContent.names;
  const nameParts = names.includes(' & ') ? names.split(' & ') : [names, ""];

  return (
    <div ref={containerRef} className="relative bg-warm-cream selection:bg-imperial-gold selection:text-white min-h-screen" style={{ color: displayContent?.colors?.text || defaultContent.colors.text }}>
      <AnimatePresence>
        {isLoading && <Preloader />}
      </AnimatePresence>

      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel 
            content={previewContent} 
            onPreviewUpdate={handlePreviewUpdate}
            onCommit={handleCommitContent} 
            onClose={handleCancelChanges} 
            hasChanges={hasChanges}
            yandexUser={yandexUser}
            onYandexLogin={handleYandexLogin}
            onAdminLogout={handleAdminLogout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoginModalOpen && (
          <AdminLoginModal 
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={(token) => {
              localStorage.setItem('adminToken', token);
              setIsAdminLoggedIn(true);
              setIsLoginModalOpen(false);
              setIsAdminOpen(true);
            }}
            onYandexLogin={handleYandexLogin}
            isLoggingInYandex={isLoggingIn}
          />
        )}
      </AnimatePresence>

      {!isLoading && isAdminLoggedIn && !isAdminOpen && !isLoginModalOpen && (
        <button 
          onClick={() => {
            const token = localStorage.getItem('adminToken');
            if (token) {
              setIsAdminOpen(true);
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          className="fixed bottom-6 right-6 z-[150] w-12 h-12 bg-stone-900 text-imperial-gold rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
        >
          <Settings size={20} />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 2 }}
      >
        {/* 1. Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={displayContent.heroImage} 
              alt="Historical Russian Manor" 
              className="w-full h-full object-cover brightness-[0.75] sepia-[0.1]"
              referrerPolicy="no-referrer"
              style={{
                transform: `translate(${displayContent.heroStyle.x}px, ${displayContent.heroStyle.y}px) rotate(${displayContent.heroStyle.rotate}deg) scale(${displayContent.heroStyle.scale})`
              }}
            />
            <div className="absolute inset-0 bg-stone-950/20" />
          </motion.div>
          
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={!isLoading ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
            >
              <div className="flex flex-col items-center gap-6 mb-12">
                <span className="text-white/70 uppercase tracking-[0.6em] text-[10px] md:text-xs font-semibold">
                  <EditableText 
                    value={displayContent.subLocation} 
                    onChange={v => handlePreviewUpdate({ ...displayContent, subLocation: v })}
                    canEdit={isAdminOpen}
                  />
                </span>
                <div className="w-px h-16 bg-white/30" />
              </div>
              
              <h1 className="text-white text-4xl md:text-[10rem] font-display font-light mb-10 md:mb-16 leading-tight md:leading-none relative z-10">
                <EditableText 
                  value={nameParts[0]} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, names: `${v} & ${nameParts[1]}` })}
                  canEdit={isAdminOpen}
                />
                <span className="italic opacity-40 font-serif text-3xl md:text-[7rem] align-middle inline-block mx-4">&</span>
                <EditableText 
                  value={nameParts[1]} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, names: `${nameParts[0]} & ${v}` })}
                  canEdit={isAdminOpen}
                />
              </h1>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20">
                <div className="text-white/90 font-display text-xl md:text-4xl italic tracking-wide">
                  <EditableText 
                    value={displayContent.date} 
                    onChange={v => handlePreviewUpdate({ ...displayContent, date: v })}
                    canEdit={isAdminOpen}
                  />
                </div>
                <div className="hidden md:block w-px h-12 bg-white/20" />
                <div className="flex flex-col items-center gap-2">
                  <EditableText 
                    className="text-white/90 font-display text-xl md:text-4xl italic tracking-wide"
                    value={displayContent.location} 
                    onChange={v => handlePreviewUpdate({ ...displayContent, location: v })}
                    canEdit={isAdminOpen}
                  />
                  <EditableText 
                    className="text-white/40 text-[8px] md:text-[9px] uppercase tracking-[0.4em]"
                    value={displayContent.manorTitle} 
                    onChange={v => handlePreviewUpdate({ ...displayContent, manorTitle: v })}
                    canEdit={isAdminOpen}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Welcome Section */}
        <section className="py-24 md:py-60 px-6 container mx-auto max-w-6xl relative group">
          
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="relative p-4 md:p-12 border border-imperial-gold/10"
            >
              <div className="absolute inset-0 border border-imperial-gold/5 m-4" />
              <div className="relative overflow-hidden aspect-[4/5]">
                <img 
                  src={displayContent.storyImage} 
                  alt="The Couple" 
                  className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05]"
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `translate(${displayContent.storyStyle.x}px, ${displayContent.storyStyle.y}px) rotate(${displayContent.storyStyle.rotate}deg) scale(${displayContent.storyStyle.scale})`
                  }}
                />
              </div>
              <div className="absolute -bottom-6 md:-bottom-10 -left-6 md:-left-10 bg-[var(--color-quote-bg)] text-imperial-gold shadow-2xl w-56 md:w-72 aspect-square flex items-center justify-center p-6 md:p-8">
                <div className="w-fit max-w-full flex flex-col items-start gap-4 md:gap-6">
                  <p className="font-display italic text-xl md:text-2xl leading-tight text-left">
                    <EditableText 
                      multiline
                      value={displayContent.storyQuote} 
                      onChange={v => handlePreviewUpdate({ ...displayContent, storyQuote: v })}
                      canEdit={isAdminOpen}
                    />
                  </p>
                  <div className="w-10 h-px bg-imperial-gold/40" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="flex flex-col gap-10"
            >
              <h2 className="text-imperial-gold font-sans text-xs uppercase tracking-[0.6em] font-bold">
                <EditableText 
                  value={displayContent.storyTitle} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, storyTitle: v })}
                  canEdit={isAdminOpen}
                />
              </h2>
              <h3 className="text-5xl md:text-7xl font-display italic text-estate-green leading-[1.1] font-light">
                <EditableText 
                  value={displayContent.storySubtitle} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, storySubtitle: v })}
                  canEdit={isAdminOpen}
                />
              </h3>
              <p className="text-stone-600 font-sans leading-loose text-lg font-light text-justify">
                <EditableText 
                  multiline
                  value={displayContent.storyDescription} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, storyDescription: v })}
                  canEdit={isAdminOpen}
                />
              </p>
              <div className="flex items-center gap-6 mt-4">
                <Ornament className="w-16 opacity-100" />
                <span className="font-display italic text-2xl text-stone-400">
                  <EditableText 
                    value={displayContent.signature} 
                    onChange={v => handlePreviewUpdate({ ...displayContent, signature: v })}
                    canEdit={isAdminOpen}
                  />
                </span>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 3. Schedule Section */}
        <section className="py-32 bg-warm-cream border-y border-imperial-gold/5 relative">
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-28"
            >
              <h2 className="text-stone-400 font-sans text-xs uppercase tracking-[0.6em] font-bold mb-8">Манифест дня</h2>
              <h3 className="text-5xl md:text-7xl font-display text-estate-green italic font-light">Праздничный вечер</h3>
              <div className="mt-8">
                <Ornament className="mx-auto" />
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {displayContent.schedule.map((item, idx) => {
                const Icon = { Wine, Utensils, Music, Heart }[item.icon] || Wine;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    className="text-center group border border-transparent hover:border-imperial-gold/10 p-8 transition-all duration-700"
                  >
                    <div className="w-12 h-12 mx-auto border border-imperial-gold/30 flex items-center justify-center mb-10 rotate-[45deg] group-hover:rotate-0 transition-transform duration-1000">
                      <Icon className="w-4 h-4 text-imperial-gold -rotate-[45deg] group-hover:rotate-0 transition-transform duration-1000" />
                    </div>
                    <span className="font-display italic text-3xl text-stone-300 group-hover:text-imperial-gold transition-colors block mb-4">
                      <EditableText 
                        value={item.time} 
                        onChange={v => {
                          const newSchedule = [...displayContent.schedule];
                          newSchedule[idx] = { ...item, time: v };
                          handlePreviewUpdate({ ...displayContent, schedule: newSchedule });
                        }}
                        canEdit={isAdminOpen}
                      />
                    </span>
                    <h4 className="font-display text-2xl text-estate-green mb-4">
                      <EditableText 
                        value={item.event} 
                        onChange={v => {
                          const newSchedule = [...displayContent.schedule];
                          newSchedule[idx] = { ...item, event: v };
                          handlePreviewUpdate({ ...displayContent, schedule: newSchedule });
                        }}
                        canEdit={isAdminOpen}
                      />
                    </h4>
                    <p className="text-stone-500 text-xs tracking-widest leading-relaxed uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                      <EditableText 
                        value={item.desc} 
                        onChange={v => {
                          const newSchedule = [...displayContent.schedule];
                          newSchedule[idx] = { ...item, desc: v };
                          handlePreviewUpdate({ ...displayContent, schedule: newSchedule });
                        }}
                        canEdit={isAdminOpen}
                      />
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Details Section */}
        <section className="py-32 md:py-60 container mx-auto px-6 max-w-6xl relative">

          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="flex flex-col gap-16 order-2 md:order-1">
              <div className="space-y-6">
                <h2 className="text-imperial-gold font-sans text-xs uppercase tracking-[0.6em] font-bold">Наставления</h2>
                <h3 className="text-5xl md:text-6xl font-display italic text-estate-green font-light">Усадебный устав</h3>
              </div>
              
              <div className="space-y-16">
                {displayContent.details.map((detail, idx) => {
                  const Icon = { MapPin, Info, Heart }[detail.icon] || Info;
                  return (
                    <div key={idx} className="flex gap-10 group">
                      <div className="flex-shrink-0 w-16 h-16 border border-stone-100 flex items-center justify-center group-hover:bg-hover-accent transition-all duration-500">
                        <Icon className="text-stone-300 w-6 h-6 group-hover:text-imperial-gold transition-colors" />
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-display text-2xl text-estate-green italic">
                          <EditableText 
                            value={detail.title} 
                            onChange={v => {
                              const newDetails = [...displayContent.details];
                              newDetails[idx] = { ...detail, title: v };
                              handlePreviewUpdate({ ...displayContent, details: newDetails });
                            }}
                            canEdit={isAdminOpen}
                          />
                        </h5>
                        <p className="text-stone-500 font-light leading-loose">
                          <EditableText 
                            multiline
                            value={detail.content} 
                            onChange={v => {
                              const newDetails = [...displayContent.details];
                              newDetails[idx] = { ...detail, content: v };
                              handlePreviewUpdate({ ...displayContent, details: newDetails });
                            }}
                            canEdit={isAdminOpen}
                          />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 1.02 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
              className="order-1 md:order-2 imperial-frame overflow-hidden"
            >
              <img 
                src={displayContent.detailsImage} 
                alt="Manor Aesthetics" 
                className="w-full aspect-[4/5] object-cover contrast-[1.1] grayscale-[0.05]"
                referrerPolicy="no-referrer"
                style={{
                  transform: `translate(${displayContent.detailsStyle.x}px, ${displayContent.detailsStyle.y}px) rotate(${displayContent.detailsStyle.rotate}deg) scale(${displayContent.detailsStyle.scale})`
                }}
              />
            </motion.div>
          </div>
        </section>

        {/* 5. RSVP Section */}
        <section id="rsvp" className="py-32 md:py-60 bg-stone-950 text-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
          
          <div className="container mx-auto px-6 relative z-10 max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display italic text-6xl md:text-[8rem] mb-12 text-imperial-gold font-light">Почта</h2>
              <p className="text-sm uppercase tracking-[0.6em] text-white/30 mb-20">
                Смиренно просим подтвердить Ваше присутствiе до{' '}
                <EditableText 
                  value={displayContent.rsvpDeadline} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, rsvpDeadline: v })}
                  canEdit={isAdminOpen}
                />
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 border border-imperial-gold/20 backdrop-blur-xl"
                >
                  <Ornament className="mx-auto mb-10" />
                  <h3 className="text-4xl font-display mb-6 italic">Ваш ответъ принятъ</h3>
                  <p className="text-white/40 font-display text-xl px-8">Мы бесконечно польщены вашим ответом. До встречи на усадебном пиру.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="text-left space-y-20">
                  <div className="grid md:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-12">
                    <div className="space-y-6">
                      <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold block">Имя Вашего Величества</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ваше Имя"
                        className={`w-full bg-transparent border-b border-white/10 pb-4 focus:outline-none focus:border-imperial-gold transition-colors font-display text-xl md:text-2xl font-light placeholder:text-white/5 ${yandexUser ? 'text-white/40' : ''}`}
                        readOnly={!!yandexUser}
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-6">
                      <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold block">Намерены ли быть?</label>
                      <select 
                        className="w-full bg-transparent border-b border-white/10 pb-4 focus:outline-none focus:border-imperial-gold transition-colors font-display text-xl md:text-2xl font-light appearance-none cursor-pointer leading-tight"
                        value={formState.attending}
                        onChange={e => setFormState({...formState, attending: e.target.value})}
                      >
                        <option value="yes" className="bg-stone-900">С радостiю прибудемъ</option>
                        <option value="no" className="bg-stone-900">Къ сожаленiю, отклонимъ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold block">Письмо молодымъ</label>
                    <textarea 
                      rows={2}
                      placeholder="Особые пожелания или вопросы..."
                      className="w-full bg-transparent border-b border-white/10 pb-4 focus:outline-none focus:border-imperial-gold transition-colors font-display text-xl md:text-2xl font-light resize-none placeholder:text-white/5 leading-tight"
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">Подтвержденiе личности</label>
                    {!yandexUser ? (
                      <button 
                        type="button"
                        onClick={handleYandexLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 py-6 hover:bg-white/10 transition-all group disabled:opacity-50 cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#f33] flex items-center justify-center text-white font-bold italic">
                          {isLoggingIn ? "..." : "Я"}
                        </span>
                        <div className="text-left">
                          <p className="text-xs uppercase tracking-widest text-white/60 group-hover:text-white">
                            {isLoggingIn ? "Ожиданiе ответа..." : "Подтвердить через Yandex ID"}
                          </p>
                          <p className="text-[10px] text-white/30">Безопасный входъ безъ лишнихъ словъ</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 py-4 px-6 bg-imperial-gold/10 border border-imperial-gold/20 rounded">
                        <img 
                          src={`https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`} 
                          className="w-10 h-10 rounded-full border border-imperial-gold/30"
                          alt="Yandex Avatar"
                        />
                        <div className="text-left">
                          <p className="text-sm font-display italic text-imperial-gold">{yandexUser.real_name || yandexUser.display_name}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest underline decoration-imperial-gold/30">Личность подтверждена</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={handleLogout}
                          className="ml-auto text-white/20 hover:text-white/60 text-[10px] uppercase tracking-widest cursor-pointer"
                        >
                          Выйти
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={!yandexUser || isSubmitting}
                    className={`w-full border py-8 text-[11px] uppercase tracking-[0.7em] transition-all duration-1000 font-bold cursor-pointer ${
                      yandexUser && !isSubmitting
                      ? "border-imperial-gold/30 hover:bg-imperial-gold hover:text-stone-950" 
                      : "border-white/5 text-white/10 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Отправка..." : (yandexUser ? "Запечатать письмо" : "Требуется авторизацiя")}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-24 bg-stone-950 text-center border-t border-white/5 text-white">
          <Ornament className="mx-auto mb-12 opacity-20" />
          <p className="font-display italic text-white/10 text-4xl mb-12 tracking-wider">
            <EditableText 
              value={displayContent.footerText} 
              onChange={v => handlePreviewUpdate({ ...displayContent, footerText: v })}
              canEdit={isAdminOpen}
            />
          </p>
          <div className="text-white/5 text-[9px] uppercase tracking-[1em] font-bold">
            СЕМЬЯ ХЕРУВИМОВЫХ • НИЖНIЙ НОВГОРОДЪ • {displayContent.date.split(' ').pop()}
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
