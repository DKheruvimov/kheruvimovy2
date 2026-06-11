import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  Settings
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { SiteContent, defaultContent, defaultImageStyle } from "./types";
import { AdminPanel } from "./components/AdminPanel";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { Ornament } from "./components/Ornament";
import { EditableText } from "./components/EditableText";
import { HeroSection } from "./components/sections/HeroSection";
import { StorySection } from "./components/sections/StorySection";
import { ScheduleSection } from "./components/sections/ScheduleSection";
import { DetailsSection } from "./components/sections/DetailsSection";
import { RsvpSection } from "./components/sections/RsvpSection";
import { CustomSection } from "./components/sections/CustomSection";
import { CountdownSection } from "./components/sections/CountdownSection";

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
  const isInsideIframe = typeof window !== 'undefined' && window.location.search.includes('iframe=true');

  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [previewContent, setPreviewContent] = useState<SiteContent>(defaultContent);
  const [isMobilePreview, setIsMobilePreview] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobileUA || window.innerWidth <= 768;
    }
    return false;
  });
  const [isWindowMobile, setIsWindowMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobileUA || window.innerWidth <= 768;
    }
    return false;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isLoading, setIsLoading] = useState(!isInsideIframe);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [yandexUser, setYandexUser] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isMobileSize = window.innerWidth <= 768 || isMobileUA;
      setIsWindowMobile(isMobileSize);
      if (isMobileSize) {
        setIsMobilePreview(true);
      }
    };
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

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
              heroStyleMobile: { ...(defaultContent.heroStyleMobile || defaultImageStyle), ...(data.heroStyleMobile || {}) },
              storyStyle: { ...defaultContent.storyStyle, ...(data.storyStyle || {}) },
              storyStyleMobile: { ...(defaultContent.storyStyleMobile || defaultImageStyle), ...(data.storyStyleMobile || {}) },
              detailsStyle: { ...defaultContent.detailsStyle, ...(data.detailsStyle || {}) },
              detailsStyleMobile: { ...(defaultContent.detailsStyleMobile || defaultImageStyle), ...(data.detailsStyleMobile || {}) }
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
              heroStyleMobile: { ...(defaultContent.heroStyleMobile || defaultImageStyle), ...(data.heroStyleMobile || {}) },
              storyStyle: { ...defaultContent.storyStyle, ...(data.storyStyle || {}) },
              storyStyleMobile: { ...(defaultContent.storyStyleMobile || defaultImageStyle), ...(data.storyStyleMobile || {}) },
              detailsStyle: { ...defaultContent.detailsStyle, ...(data.detailsStyle || {}) },
              detailsStyleMobile: { ...(defaultContent.detailsStyleMobile || defaultImageStyle), ...(data.detailsStyleMobile || {}) }
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
    if (isInsideIframe) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isInsideIframe]);

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
    if (isInsideIframe && typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        (window.parent as any).__updatePreviewFromIframe?.(newContent);
      } catch (e) {
        console.warn("Parent update fail:", e);
      }
    }
  };

  useEffect(() => {
    if (isInsideIframe) {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        try {
          const parentContent = (window.parent as any).__wedding_preview_content;
          if (parentContent) {
            setContent(parentContent);
            setPreviewContent(parentContent);
          }
        } catch (e) {
          console.warn("Parent initial content read error:", e);
        }

        (window as any).__updatePreviewContent = (newContent: SiteContent) => {
          setContent(newContent);
          setPreviewContent(newContent);
        };
      }
    } else {
      if (typeof window !== 'undefined') {
        (window as any).__updatePreviewFromIframe = (newContent: SiteContent) => {
          setPreviewContent(newContent);
        };
      }
    }
  }, [isInsideIframe]);

  useEffect(() => {
    if (!isInsideIframe && typeof window !== 'undefined') {
      (window as any).__wedding_preview_content = previewContent;
      
      const iframeEl = document.getElementById("mobile-preview-iframe") as HTMLIFrameElement | null;
      if (iframeEl && iframeEl.contentWindow) {
        try {
          (iframeEl.contentWindow as any).__updatePreviewContent?.(previewContent);
        } catch (e) {}
      }
    }
  }, [previewContent, isInsideIframe]);

  const handleCancelChanges = () => {
    setPreviewContent(content);
    setIsAdminOpen(false);
  };
  
  const isMobile = isMobilePreview || isWindowMobile;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const displayContent = isAdminOpen ? previewContent : content;
  const hasChanges = JSON.stringify(content) !== JSON.stringify(previewContent);

  const activeHeroImage = (isMobile && displayContent.heroImageMobile) ? displayContent.heroImageMobile : displayContent.heroImage;
  const activeHeroStyle = (isMobile && displayContent.heroStyleMobile) ? displayContent.heroStyleMobile : displayContent.heroStyle;

  const activeStoryImage = (isMobile && displayContent.storyImageMobile) ? displayContent.storyImageMobile : displayContent.storyImage;
  const activeStoryStyle = (isMobile && displayContent.storyStyleMobile) ? displayContent.storyStyleMobile : displayContent.storyStyle;

  const activeDetailsImage = (isMobile && displayContent.detailsImageMobile) ? displayContent.detailsImageMobile : displayContent.detailsImage;
  const activeDetailsStyle = (isMobile && displayContent.detailsStyleMobile) ? displayContent.detailsStyleMobile : displayContent.detailsStyle;

  useEffect(() => {
    const root = document.documentElement;
    const colors = displayContent?.colors || defaultContent.colors;
    
    root.style.setProperty('--color-imperial-gold', colors.primary || defaultContent.colors.primary);
    root.style.setProperty('--color-warm-cream', colors.bg || defaultContent.colors.bg);
    root.style.setProperty('--color-estate-green', colors.text || defaultContent.colors.text);
    root.style.setProperty('--color-hover-accent', colors.hover || defaultContent.colors.hover);
    root.style.setProperty('--color-quote-bg', colors.quoteBg || defaultContent.colors.quoteBg);
  }, [displayContent?.colors]);

  useEffect(() => {
    const faviconUrl = displayContent?.faviconUrl || "/favicon.svg";
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = faviconUrl;
      if (faviconUrl.endsWith(".svg")) {
        link.type = "image/svg+xml";
      } else {
        link.type = "image/png";
      }
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconUrl;
      newLink.type = faviconUrl.endsWith(".svg") ? "image/svg+xml" : "image/png";
      document.head.appendChild(newLink);
    }
  }, [displayContent?.faviconUrl]);

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

  const pageContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 2 }}
    >
        {/* 1. Hero Section */}
        <HeroSection 
          displayContent={displayContent}
          handlePreviewUpdate={handlePreviewUpdate}
          isAdminOpen={isAdminOpen}
          isLoading={isLoading}
          activeHeroImage={activeHeroImage}
          activeHeroStyle={activeHeroStyle}
          scrollYProgress={scrollYProgress}
        />

        {/* 1.5 Countdown Timer */}
        <CountdownSection displayContent={displayContent} />

        {/* Dynamic Sections rendering in custom order and custom visibility */}
        {(displayContent.sections || [
          { id: 'story', title: 'Наша исторiя', visible: true },
          { id: 'schedule', title: 'Распорядокъ дня', visible: true },
          { id: 'details', title: 'Усадебный уставъ', visible: true },
          { id: 'rsvp', title: 'Почта', visible: true }
        ])
          .filter(sec => sec.visible !== false)
          .map((sec) => {
            if (sec.id === 'story') {
              return (
                <StorySection 
                  key="story"
                  displayContent={displayContent}
                  handlePreviewUpdate={handlePreviewUpdate}
                  isAdminOpen={isAdminOpen}
                  activeStoryImage={activeStoryImage}
                  activeStoryStyle={activeStoryStyle}
                />
              );
            }

            if (sec.id === 'schedule') {
              return (
                <ScheduleSection 
                  key="schedule"
                  displayContent={displayContent}
                  handlePreviewUpdate={handlePreviewUpdate}
                  isAdminOpen={isAdminOpen}
                />
              );
            }

            if (sec.id === 'details') {
              return (
                <DetailsSection 
                  key="details"
                  displayContent={displayContent}
                  handlePreviewUpdate={handlePreviewUpdate}
                  isAdminOpen={isAdminOpen}
                  activeDetailsImage={activeDetailsImage}
                  activeDetailsStyle={activeDetailsStyle}
                />
              );
            }

            if (sec.id === 'rsvp') {
              return (
                <RsvpSection 
                  key="rsvp"
                  displayContent={displayContent}
                  handlePreviewUpdate={handlePreviewUpdate}
                  isAdminOpen={isAdminOpen}
                  isSubmitted={isSubmitted}
                  isSubmitting={isSubmitting}
                  handleSubmit={handleSubmit}
                  formState={formState}
                  setFormState={setFormState}
                  yandexUser={yandexUser}
                  isLoggingIn={isLoggingIn}
                  handleYandexLogin={handleYandexLogin}
                  handleLogout={handleLogout}
                />
              );
            }

            return (
              <CustomSection 
                key={sec.id}
                sec={sec}
                displayContent={displayContent}
                handlePreviewUpdate={handlePreviewUpdate}
                isAdminOpen={isAdminOpen}
                isMobile={isMobile}
              />
            );
          })}

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
    );

    if (isInsideIframe) {
      return (
        <div ref={containerRef} className="relative bg-warm-cream selection:bg-imperial-gold selection:text-white min-h-screen" style={{ color: displayContent?.colors?.text || defaultContent.colors.text }}>
          {pageContent}
        </div>
      );
    }

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
              isMobilePreview={isMobilePreview}
              onMobilePreviewToggle={() => setIsMobilePreview(!isMobilePreview)}
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

        {isMobilePreview && !isWindowMobile ? (
          <div className="fixed inset-0 flex items-center justify-center bg-stone-950/90 py-12 z-[90] overflow-y-auto">
            {/* Smartphone Mock Frame */}
            <div className="w-[390px] h-[844px] bg-warm-cream rounded-[56px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[14px] border-stone-850 relative flex flex-col flex-shrink-0 animate-fade-in ring-1 ring-stone-700">
              {/* Top Notch Status */}
              <div className="absolute top-2.5 inset-x-0 h-6 z-[99] flex justify-center items-center pointer-events-none">
                <div className="w-32 h-5.5 bg-stone-900 rounded-full flex items-center justify-between px-3 text-[9px] text-stone-400 font-mono">
                  <span className="font-semibold text-white">09:41</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-800 flex-shrink-0" />
                  <div className="flex gap-1 items-center">
                    <span className="tracking-tighter">5G</span>
                    <div className="w-3.5 h-2 rounded-[2px] border border-stone-400 flex items-center p-[0.5px]">
                      <div className="bg-stone-400 h-full w-[80%] rounded-[1px]" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Native Mobile Preview via Iframe to trigger media query break points perfectly */}
              <iframe
                id="mobile-preview-iframe"
                src={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?iframe=true` : "/?iframe=true"}
                className="flex-grow w-full bg-warm-cream border-0 rounded-[42px] h-full overflow-y-auto"
                title="Mobile Preview Frame"
              />
            </div>
          </div>
        ) : (
          pageContent
        )}
      </div>
    );
  }
