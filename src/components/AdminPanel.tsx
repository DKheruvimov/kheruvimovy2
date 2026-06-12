import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { SiteContent, defaultImageStyle } from '../types';
import { 
  Save, X, Image as ImageIcon, Users, Layout, Palette, 
  Shield, Settings, AlignLeft, AlignRight, Smartphone, Minimize2, Maximize2
} from 'lucide-react';

import { ContentTab } from './admin/ContentTab';
import { ColorsTab } from './admin/ColorsTab';
import { RsvpsTab } from './admin/RsvpsTab';
import { AccessTab } from './admin/AccessTab';
import { YandexConfigTab } from './admin/YandexConfigTab';
import { MediaTab } from './admin/MediaTab';

interface AdminPanelProps {
  content: SiteContent;
  onPreviewUpdate: (newContent: SiteContent) => void;
  onCommit: (newContent: SiteContent) => void;
  onClose: () => void;
  hasChanges: boolean;
  yandexUser: any;
  onYandexLogin: () => void;
  onAdminLogout: () => void;
  isMobilePreview: boolean;
  onMobilePreviewToggle: () => void;
  isTestingPreloader: boolean;
  onTestPreloaderToggle: (val: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  content, 
  onPreviewUpdate, 
  onCommit, 
  onClose, 
  hasChanges,
  yandexUser,
  onYandexLogin,
  onAdminLogout,
  isMobilePreview,
  onMobilePreviewToggle,
  isTestingPreloader,
  onTestPreloaderToggle
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'colors' | 'rsvps' | 'access' | 'yandex_config' | 'media'>('content');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [linkedYandexList, setLinkedYandexList] = useState<any[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  // Media Library state
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isDeletingMediaName, setIsDeletingMediaName] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Resizing and Docking state
  const [panelWidth, setPanelWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('adminPanelWidth');
      if (savedWidth) return parseInt(savedWidth, 10);
      if (window.innerWidth < 640) return window.innerWidth;
    }
    return 480;
  });

  const [dockSide, setDockSide] = useState<'left' | 'right'>(() => {
    if (typeof window !== 'undefined') {
      const savedDock = localStorage.getItem('adminPanelDock');
      if (savedDock === 'left' || savedDock === 'right') return savedDock;
    }
    return 'right';
  });

  const [isDragging, setIsDragging] = useState(false);

  // handle mouse down on the drag handle
  const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsDragging(true);
    mouseDownEvent.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = panelWidth;
      if (dockSide === 'right') {
        newWidth = window.innerWidth - e.clientX;
      } else {
        newWidth = e.clientX;
      }
      const minWidth = 320;
      const maxWidth = window.innerWidth - 40;
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('adminPanelWidth', panelWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dockSide, panelWidth]);

  // Yandex dynamic keys configuration state
  const [yandexClientId, setYandexClientId] = useState('');
  const [yandexClientSecret, setYandexClientSecret] = useState('');
  const [isSavingYandex, setIsSavingYandex] = useState(false);
  const [yandexStatusMessage, setYandexStatusMessage] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (activeTab === 'rsvps') {
      fetchRsvps();
    } else if (activeTab === 'access') {
      fetchLinkedYandex();
    } else if (activeTab === 'yandex_config') {
      fetchYandexConfig();
    } else if (activeTab === 'media') {
      fetchMediaFiles();
    }
  }, [activeTab]);

  const fetchMediaFiles = async () => {
    if (!adminToken) return;
    setIsLoadingMedia(true);
    setMediaError('');
    try {
      const res = await fetch('/api/uploads', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      } else {
        setMediaError('Не удалось загрузить список файлов');
      }
    } catch (err) {
      console.error(err);
      setMediaError('Ошибка подключения к серверу');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleDeleteMedia = async (name: string) => {
    if (!adminToken) return;
    setIsDeletingMediaName(name);
    try {
      const res = await fetch(`/api/uploads/${name}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMediaFiles(prev => prev.filter(f => f.name !== name));
      } else {
        alert('Не удалось удалить файл');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при соединении с сервером');
    } finally {
      setIsDeletingMediaName(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy", err);
      });
  };

  const fetchYandexConfig = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/yandex-config', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setYandexClientId(data.clientId || '');
        setYandexClientSecret(data.clientSecret || '');
      }
    } catch (err) {
      console.error("Failed to fetch Yandex config", err);
    }
  };

  const handleSaveYandexConfig = async () => {
    if (!adminToken) return;
    setIsSavingYandex(true);
    setYandexStatusMessage('');
    try {
      const res = await fetch('/api/admin/yandex-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          clientId: yandexClientId,
          clientSecret: yandexClientSecret
        })
      });
      if (res.ok) {
        setYandexStatusMessage('Настройки сохранены благополучно!');
      } else {
        setYandexStatusMessage('Ошибка сохранения настроек.');
      }
    } catch (err) {
      console.error(err);
      setYandexStatusMessage('Не удалось подключиться к серверу.');
    } finally {
      setIsSavingYandex(false);
    }
  };

  // Fetch linked Yandex users
  const fetchLinkedYandex = async () => {
    if (!adminToken) return;
    setIsLoadingLinks(true);
    try {
      const res = await fetch('/api/admin/linked-yandex', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLinkedYandexList(data);
      }
    } catch (err) {
      console.error("Failed to fetch linked Yandex list", err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  // Link active Yandex user
  const handleLinkYandex = async () => {
    if (!adminToken || !yandexUser) return;
    try {
      const res = await fetch('/api/admin/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          yandexId: yandexUser.id,
          login: yandexUser.login,
          realName: yandexUser.real_name || yandexUser.display_name,
          avatarUrl: `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`
        })
      });
      if (res.ok) {
        fetchLinkedYandex();
      }
    } catch (err) {
      console.error("Failed to link account", err);
    }
  };

  // Unlink Yandex user
  const handleUnlinkYandex = async (yandexId: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ yandexId })
      });
      if (res.ok) {
        fetchLinkedYandex();
      }
    } catch (err) {
      console.error("Failed to unlink account", err);
    }
  };

  // State for image uploads loading indicator
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const compressImage = (file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<{ blob: Blob; type: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ blob: file, type: file.type });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, type: 'image/jpeg' });
              } else {
                resolve({ blob: file, type: file.type });
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Image load error'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUploadForField = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'heroImage' | 'storyImage' | 'detailsImage' | 'heroImageMobile' | 'storyImageMobile' | 'detailsImageMobile' | 'faviconUrl' | 'customOrnamentUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;

    // Set uploading state to true for this field
    setUploadingState(prev => ({ ...prev, [field]: true }));

    try {
      // Compress and resize image to prevent Nginx 413 (Payload Too Large) on VM
      let uploadBlob: Blob = file;
      let uploadType: string = file.type;

      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        try {
          const compressed = await compressImage(file);
          uploadBlob = compressed.blob;
          uploadType = compressed.type;
        } catch (compressErr) {
          console.error("Failed to compress image, using original", compressErr);
        }
      }

      // Read file as raw ArrayBuffer
      const buffer = await uploadBlob.arrayBuffer();

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': uploadType,
          'Authorization': `Bearer ${adminToken}`
        },
        body: buffer
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          handleChange(field, data.url);
        } else {
          alert('Ошибка при сохранении файла на сервере.');
        }
      } else {
        alert('Не удалось загрузить изображение. Проверьте размер файла.');
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Ошибка при соединении с сервером');
    } finally {
      setUploadingState(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleImageUploadForCustomSection = async (
    file: File,
    sectionId: string,
    imgKey: 'image' | 'imageMobile',
    onComplete: (url: string) => void
  ) => {
    if (!file || !adminToken) return;
    const uploadFieldId = `${sectionId}_${imgKey}`;
    setUploadingState(prev => ({ ...prev, [uploadFieldId]: true }));

    try {
      let uploadBlob: Blob = file;
      let uploadType: string = file.type;

      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        try {
          const compressed = await compressImage(file);
          uploadBlob = compressed.blob;
          uploadType = compressed.type;
        } catch (compressErr) {
          console.error("Failed to compress image, using original", compressErr);
        }
      }

      const buffer = await uploadBlob.arrayBuffer();

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': uploadType,
          'Authorization': `Bearer ${adminToken}`
        },
        body: buffer
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          onComplete(data.url);
        } else {
          alert('Ошибка при сохранении файла на сервере.');
        }
      } else {
        alert('Не удалось загрузить изображение. Проверьте размер файла.');
      }
    } catch (err) {
      console.error('Error uploading custom section image', err);
      alert('Ошибка при соединении с сервером');
    } finally {
      setUploadingState(prev => ({ ...prev, [uploadFieldId]: false }));
    }
  };

  const handleDeleteRsvp = async (id: string, name: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/rsvp/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        fetchRsvps();
      } else {
        alert("Не удалось удалить гостя");
      }
    } catch (err) {
      console.error("Failed to delete rsvp", err);
      alert("Ошибка при выполнении удаления гостя");
    }
  };

  const fetchRsvps = async () => {
    setIsLoadingRsvps(true);
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      const res = await fetch('/api/rsvp', { headers });
      if (res.ok) {
        const data = await res.json();
        setRsvps(data);
      }
    } catch (err) {
      console.error("Failed to fetch rsvps", err);
    } finally {
      setIsLoadingRsvps(false);
    }
  };

  const handleChange = (field: keyof SiteContent, value: any) => {
    onPreviewUpdate({ ...content, [field]: value });
  };

  const handleSave = () => {
    onCommit(content);
  };

  return (
    <motion.div 
      initial={{ x: dockSide === 'right' ? '100%' : '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: dockSide === 'right' ? '100%' : '-100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`fixed top-0 z-[200] h-screen bg-white/95 backdrop-blur-md shadow-2xl flex flex-col text-stone-900 ${
        dockSide === 'left' ? 'left-0 border-r border-stone-200' : 'right-0 border-l border-stone-200'
      } ${
        isFullScreen ? 'w-full' : 'w-full max-w-full'
      } ${
        isDragging ? '' : 'transition-[width,transform] duration-300'
      }`}
      style={{
        width: isFullScreen ? '100vw' : (typeof window !== 'undefined' && window.innerWidth < 640 ? '100vw' : `${panelWidth}px`)
      }}
    >
      {/* Resizing Drag Handle */}
      {!isFullScreen && (
        <div 
          onMouseDown={startResizing}
          className={`absolute top-0 w-2 h-full cursor-ew-resize hover:bg-imperial-gold/30 active:bg-imperial-gold/50 transition-colors z-[210] flex items-center justify-center group ${
            dockSide === 'right' ? 'left-0' : 'right-0'
          }`}
          title="Перетащите для изменения ширины"
        >
          <div className="w-[2px] h-10 bg-stone-350 group-hover:bg-imperial-gold rounded transition-all opacity-40 group-hover:opacity-100 flex flex-col justify-between py-1">
            <span className="w-0.5 h-0.5 bg-current rounded-full"></span>
            <span className="w-0.5 h-0.5 bg-current rounded-full"></span>
            <span className="w-0.5 h-0.5 bg-current rounded-full"></span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-white/50">
        <div className="flex gap-4 overflow-x-auto flex-nowrap pb-1 no-scrollbar flex-grow mr-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'content' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Layout size={18} />
            <span className="font-sans text-sm font-semibold">Контент</span>
          </button>
          <button 
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'colors' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Palette size={18} />
            <span className="font-sans text-sm font-semibold">Палитра</span>
          </button>
          <button 
            onClick={() => setActiveTab('rsvps')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'rsvps' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Users size={18} />
            <span className="font-sans text-sm font-semibold">Гости</span>
          </button>
          <button 
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'access' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Shield size={18} />
            <span className="font-sans text-sm font-semibold">Доступ</span>
          </button>
          <button 
            onClick={() => setActiveTab('yandex_config')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'yandex_config' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Settings size={18} />
            <span className="font-sans text-sm font-semibold">Yandex ID</span>
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'media' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <ImageIcon size={18} />
            <span className="font-sans text-sm font-semibold">Медиатека</span>
          </button>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            onClick={onMobilePreviewToggle}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${isMobilePreview ? 'bg-imperial-gold/15 text-imperial-gold border border-imperial-gold/20' : 'hover:bg-stone-100 text-stone-400'}`}
            title={isMobilePreview ? "Показать десктопную версию" : "Включить мобильный предпросмотр"}
          >
            <Smartphone size={18} />
          </button>
          <button 
            onClick={() => {
              const nextSide = dockSide === 'right' ? 'left' : 'right';
              setDockSide(nextSide);
              localStorage.setItem('adminPanelDock', nextSide);
            }}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 flex-shrink-0"
            title={dockSide === 'right' ? "Прикрепить слева" : "Прикрепить справа"}
          >
            {dockSide === 'right' ? <AlignLeft size={18} /> : <AlignRight size={18} />}
          </button>
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 flex-shrink-0"
            title={isFullScreen ? "Свернуть" : "Развернуть во весь экран"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-6 py-8">
        {activeTab === 'content' ? (
          <ContentTab
            content={content}
            onChange={handleChange}
            uploadingState={uploadingState}
            isMobilePreview={isMobilePreview}
            onMobilePreviewToggle={onMobilePreviewToggle}
            isTestingPreloader={isTestingPreloader}
            onTestPreloaderToggle={onTestPreloaderToggle}
            handleImageUploadForField={handleImageUploadForField}
            handleImageUploadForCustomSection={handleImageUploadForCustomSection}
          />
        ) : activeTab === 'colors' ? (
          <ColorsTab
            content={content}
            onChange={handleChange}
          />
        ) : activeTab === 'rsvps' ? (
          <RsvpsTab
            rsvps={rsvps}
            isLoadingRsvps={isLoadingRsvps}
            onDeleteRsvp={handleDeleteRsvp}
          />
        ) : activeTab === 'access' ? (
          <AccessTab
            yandexUser={yandexUser}
            linkedYandexList={linkedYandexList}
            isLoadingLinks={isLoadingLinks}
            onAdminLogout={onAdminLogout}
            onYandexLogin={onYandexLogin}
            onLinkYandex={handleLinkYandex}
            onUnlinkYandex={handleUnlinkYandex}
          />
        ) : activeTab === 'yandex_config' ? (
          <YandexConfigTab
            yandexClientId={yandexClientId}
            setYandexClientId={setYandexClientId}
            yandexClientSecret={yandexClientSecret}
            setYandexClientSecret={setYandexClientSecret}
            isSavingYandex={isSavingYandex}
            yandexStatusMessage={yandexStatusMessage}
            onSaveConfig={handleSaveYandexConfig}
          />
        ) : activeTab === 'media' ? (
          <MediaTab
            mediaFiles={mediaFiles}
            isLoadingMedia={isLoadingMedia}
            mediaError={mediaError}
            onCopyUrl={handleCopyUrl}
            onDeleteMedia={handleDeleteMedia}
            isDeletingMediaName={isDeletingMediaName}
            copiedUrl={copiedUrl}
          />
        ) : null}
      </div>

      <div className="p-6 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-4">
        <button 
          onClick={onClose}
          className="px-4 py-2 text-stone-400 text-[10px] uppercase tracking-widest hover:text-stone-600 cursor-pointer"
        >
          Отмена
        </button>
        <button 
          disabled={!hasChanges}
          onClick={handleSave}
          className={`flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
            hasChanges 
            ? 'bg-stone-900 text-imperial-gold hover:bg-stone-800 shadow-lg cursor-pointer' 
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Save size={14} />
          Сохранить изменения
        </button>
      </div>
    </motion.div>
  );
};
