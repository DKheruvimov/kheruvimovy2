import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { SiteContent, ScheduleItem, DetailItem, defaultImageStyle } from '../types';
import { 
  Save, Plus, Trash2, X, Image as ImageIcon, Users, Layout, Palette, 
  Shield, Link2, Unlink, LogOut, Key, Check, Settings, Maximize2, Minimize2,
  AlignLeft, AlignRight, Smartphone
} from 'lucide-react';

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
}

const ImageStyleControls = ({ 
  label, 
  style, 
  onChange 
}: { 
  label: string, 
  style: any, 
  onChange: (newStyle: any) => void 
}) => (
  <div className="p-3 bg-stone-50/50 rounded-lg space-y-3 border border-stone-100">
    <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">{label}</p>
    <div className="grid grid-cols-1 gap-3">
      <div className="space-y-1">
        <label className="text-[9px] text-stone-400 flex justify-between uppercase">Масштаб</label>
        <div className="flex items-center gap-3">
          <input 
            type="range" min="0.5" max="5" step="0.01" 
            value={style.scale} 
            onChange={e => onChange({ ...style, scale: parseFloat(e.target.value) })}
            className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
          />
          <input 
            type="number" step="0.01"
            value={style.scale} 
            onChange={e => onChange({ ...style, scale: parseFloat(e.target.value) || 0 })}
            className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[9px] text-stone-400 flex justify-between uppercase">Угол (°)</label>
        <div className="flex items-center gap-3">
          <input 
            type="range" min="-180" max="180" step="1" 
            value={style.rotate} 
            onChange={e => onChange({ ...style, rotate: parseInt(e.target.value) })}
            className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
          />
          <input 
            type="number"
            value={style.rotate} 
            onChange={e => onChange({ ...style, rotate: parseInt(e.target.value) || 0 })}
            className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[9px] text-stone-400 flex justify-between uppercase">Сдвиг X (px)</label>
        <div className="flex items-center gap-3">
          <input 
            type="range" min="-400" max="400" step="1" 
            value={style.x} 
            onChange={e => onChange({ ...style, x: parseInt(e.target.value) })}
            className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
          />
          <input 
            type="number"
            value={style.x} 
            onChange={e => onChange({ ...style, x: parseInt(e.target.value) || 0 })}
            className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[9px] text-stone-400 flex justify-between uppercase">Сдвиг Y (px)</label>
        <div className="flex items-center gap-3">
          <input 
            type="range" min="-400" max="400" step="1" 
            value={style.y} 
            onChange={e => onChange({ ...style, y: parseInt(e.target.value) })}
            className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
          />
          <input 
            type="number"
            value={style.y} 
            onChange={e => onChange({ ...style, y: parseInt(e.target.value) || 0 })}
            className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold"
          />
        </div>
      </div>
    </div>
  </div>
);

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
  onMobilePreviewToggle
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'colors' | 'rsvps' | 'access' | 'yandex_config'>('content');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [linkedYandexList, setLinkedYandexList] = useState<any[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

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
    }
  }, [activeTab]);

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
    if (!window.confirm("Вы уверены, что хотите отвязать этот аккаунт Яндекс? Он потеряет административный доступ.")) return;
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
    field: 'heroImage' | 'storyImage' | 'detailsImage' | 'heroImageMobile' | 'storyImageMobile' | 'detailsImageMobile'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;

    // Set uploading state to true for this field
    setUploadingState(prev => ({ ...prev, [field]: true }));

    try {
      // Compress and resize image to prevent Nginx 413 (Payload Too Large) on VM
      let uploadBlob: Blob = file;
      let uploadType: string = file.type;

      if (file.type.startsWith('image/')) {
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

  const handleDeleteRsvp = async (id: string, name: string) => {
    if (!adminToken) return;
    if (!window.confirm(`Вы уверены, что хотите удалить подтверждение от ${name}?`)) return;
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
            <span className="font-display italic text-lg leading-none pt-1">Контентъ</span>
          </button>
          <button 
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'colors' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Palette size={18} />
            <span className="font-display italic text-lg leading-none pt-1">Палитра</span>
          </button>
          <button 
            onClick={() => setActiveTab('rsvps')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'rsvps' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Users size={18} />
            <span className="font-display italic text-lg leading-none pt-1">Гости</span>
          </button>
          <button 
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'access' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Shield size={18} />
            <span className="font-display italic text-lg leading-none pt-1">Доступъ</span>
          </button>
          <button 
            onClick={() => setActiveTab('yandex_config')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 ${activeTab === 'yandex_config' ? 'bg-imperial-gold/10 text-imperial-gold' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <Settings size={18} />
            <span className="font-display italic text-lg leading-none pt-1">Yandex ID</span>
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
          <div className="space-y-10 pb-20">
            <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
              <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest">Settings mode</p>
              <p className="text-[10px] text-stone-500 mt-1">Отредактируйте параметры и нажмите «Сохранить».</p>
            </div>

            {/* General Info */}
            <section className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Общая информация</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold">Имена на главной</label>
                  <input 
                    type="text" 
                    className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent"
                    value={content.names}
                    onChange={e => handleChange('names', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold">Дата</label>
                  <input 
                    type="text" 
                    className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent"
                    value={content.date}
                    onChange={e => handleChange('date', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold">Город</label>
                  <input 
                    type="text" 
                    className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent"
                    value={content.location}
                    onChange={e => handleChange('location', e.target.value)}
                  />
                </div>
              </div>
            </section>

             {/* Media */}
            <section className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Изображения</h3>
              
              {/* Quick toggle banner for the modes */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${isMobilePreview ? 'bg-imperial-gold/15 text-imperial-gold border border-imperial-gold/20' : 'bg-stone-100 text-stone-500'}`}>
                    <Smartphone size={16} />
                  </span>
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider font-bold text-stone-400">
                      Редактируемый режимъ:
                    </h4>
                    <span className="text-xs font-semibold text-stone-800">
                      {isMobilePreview ? "Мобильная версія 📱" : "Компьютерная версія 💻"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onMobilePreviewToggle}
                  className="px-3 py-1.5 bg-white border border-stone-200 hover:border-imperial-gold hover:text-imperial-gold text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {isMobilePreview ? "На десктопъ" : "На мобильн."}
                </button>
              </div>

              <div className="space-y-8">
                {(() => {
                  const heroField: keyof SiteContent = isMobilePreview ? 'heroImageMobile' : 'heroImage';
                  const heroStyleField: keyof SiteContent = isMobilePreview ? 'heroStyleMobile' : 'heroStyle';
                  const currentHeroImage = content[heroField] as string || "";
                  const currentHeroStyle = content[heroStyleField] || defaultImageStyle;
                  const displayHeroSrc = currentHeroImage || content.heroImage;

                  const storyField: keyof SiteContent = isMobilePreview ? 'storyImageMobile' : 'storyImage';
                  const storyStyleField: keyof SiteContent = isMobilePreview ? 'storyStyleMobile' : 'storyStyle';
                  const currentStoryImage = content[storyField] as string || "";
                  const currentStoryStyle = content[storyStyleField] || defaultImageStyle;
                  const displayStorySrc = currentStoryImage || content.storyImage;

                  const detailsField: keyof SiteContent = isMobilePreview ? 'detailsImageMobile' : 'detailsImage';
                  const detailsStyleField: keyof SiteContent = isMobilePreview ? 'detailsStyleMobile' : 'detailsStyle';
                  const currentDetailsImage = content[detailsField] as string || "";
                  const currentDetailsStyle = content[detailsStyleField] || defaultImageStyle;
                  const displayDetailsSrc = currentDetailsImage || content.detailsImage;

                  return (
                    <>
                      {/* 1. HERO IMAGE */}
                      <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-stone-700 font-display italic">1. Главный экран (Hero)</h4>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                            {isMobilePreview ? "Мобильное фото" : "Десктопное фото"}
                          </span>
                        </div>
                        
                        <div className="space-y-3 p-3 bg-white rounded-lg border border-stone-150 shadow-sm">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                              <img src={displayHeroSrc} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              {uploadingState[heroField] ? (
                                <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                              ) : (
                                <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                                  <span>Фото (URL)</span>
                                  <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                                    <Plus size={10} />
                                    Загрузить
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={e => handleImageUploadForField(e, heroField)}
                                    />
                                  </span>
                                </label>
                              )}
                              <input 
                                type="text" 
                                className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                                placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                                value={currentHeroImage}
                                onChange={e => handleChange(heroField, e.target.value)}
                              />
                            </div>
                          </div>
                          <ImageStyleControls 
                            label={`Настройка отображения (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                            style={currentHeroStyle} 
                            onChange={s => handleChange(heroStyleField, s)} 
                          />
                        </div>
                      </div>

                      {/* 2. STORY IMAGE */}
                      <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-stone-700 font-display italic">2. О нашем союзе (История)</h4>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                            {isMobilePreview ? "Мобильное фото" : "Десктопное фото"}
                          </span>
                        </div>
                        
                        <div className="space-y-3 p-3 bg-white rounded-lg border border-stone-150 shadow-sm">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                              <img src={displayStorySrc} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              {uploadingState[storyField] ? (
                                <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                              ) : (
                                <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                                  <span>Фото (URL)</span>
                                  <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                                    <Plus size={10} />
                                    Загрузить
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={e => handleImageUploadForField(e, storyField)}
                                    />
                                  </span>
                                </label>
                              )}
                              <input 
                                type="text" 
                                className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                                placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                                value={currentStoryImage}
                                onChange={e => handleChange(storyField, e.target.value)}
                              />
                            </div>
                          </div>
                          <ImageStyleControls 
                            label={`Настройка отображения (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                            style={currentStoryStyle} 
                            onChange={s => handleChange(storyStyleField, s)} 
                          />
                        </div>
                      </div>

                      {/* 3. DETAILS IMAGE */}
                      <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-stone-700 font-display italic">3. Детали торжества (Инфо)</h4>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                            {isMobilePreview ? "Мобильное фото" : "Десктопное фото"}
                          </span>
                        </div>
                        
                        <div className="space-y-3 p-3 bg-white rounded-lg border border-stone-150 shadow-sm">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                              <img src={displayDetailsSrc} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              {uploadingState[detailsField] ? (
                                <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                              ) : (
                                <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                                  <span>Фото (URL)</span>
                                  <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                                    <Plus size={10} />
                                    Загрузить
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={e => handleImageUploadForField(e, detailsField)}
                                    />
                                  </span>
                                </label>
                              )}
                              <input 
                                type="text" 
                                className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                                placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                                value={currentDetailsImage}
                                onChange={e => handleChange(detailsField, e.target.value)}
                              />
                            </div>
                          </div>
                          <ImageStyleControls 
                            label={`Настройка отображения (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                            style={currentDetailsStyle} 
                            onChange={s => handleChange(detailsStyleField, s)} 
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </section>

            {/* Story Text */}
            <section className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Наша исторiя</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold">Подзаголовок</label>
                  <input 
                    type="text" 
                    className="w-full border-b border-stone-200 py-1 outline-none text-sm italic bg-transparent"
                    value={content.storySubtitle}
                    onChange={e => handleChange('storySubtitle', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold">Описание</label>
                  <textarea 
                    rows={3}
                    className="w-full border border-stone-200 p-2 text-sm outline-none focus:border-imperial-gold bg-transparent"
                    value={content.storyDescription}
                    onChange={e => handleChange('storyDescription', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-imperial-gold/10 pb-2">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold">Распорядокъ дня</h3>
              </div>
              <div className="space-y-4">
                {content.schedule.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded border border-stone-100 space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="w-16 border-b border-stone-200 py-1 text-xs outline-none focus:border-imperial-gold font-mono bg-transparent"
                        value={item.time}
                        onChange={e => {
                          const newSchedule = [...content.schedule];
                          newSchedule[idx] = { ...item, time: e.target.value };
                          handleChange('schedule', newSchedule);
                        }}
                      />
                      <input 
                        type="text" 
                        className="flex-grow border-b border-stone-200 py-1 text-xs outline-none focus:border-imperial-gold font-bold bg-transparent"
                        value={item.event}
                        onChange={e => {
                          const newSchedule = [...content.schedule];
                          newSchedule[idx] = { ...item, event: e.target.value };
                          handleChange('schedule', newSchedule);
                        }}
                      />
                    </div>
                    <textarea 
                      rows={1}
                      className="w-full border-b border-stone-100 bg-transparent py-1 text-[10px] outline-none text-stone-500 italic"
                      value={item.desc}
                      onChange={e => {
                        const newSchedule = [...content.schedule];
                        newSchedule[idx] = { ...item, desc: e.target.value };
                        handleChange('schedule', newSchedule);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Details */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-imperial-gold/10 pb-2">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold">Усадебный уставъ</h3>
              </div>
              <div className="space-y-4">
                {content.details.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded border border-stone-100 space-y-3">
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-1 text-xs outline-none focus:border-imperial-gold font-bold italic bg-transparent"
                      value={item.title}
                      onChange={e => {
                        const newDetails = [...content.details];
                        newDetails[idx] = { ...item, title: e.target.value };
                        handleChange('details', newDetails);
                      }}
                    />
                    <textarea 
                      rows={2}
                      className="w-full border-b border-stone-100 bg-transparent py-1 text-[10px] outline-none text-stone-500"
                      value={item.content}
                      onChange={e => {
                        const newDetails = [...content.details];
                        newDetails[idx] = { ...item, content: e.target.value };
                        handleChange('details', newDetails);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : activeTab === 'colors' ? (
          <div className="space-y-8 pb-20">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Усадебная палитра</h3>
            <div className="grid grid-cols-1 gap-8">
              {/* Primary Color */}
              <div className="space-y-3">
                <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                  Основной цвет (Золото)
                  <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.primary}</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
                    value={content.colors?.primary || "#b5955a"}
                    onChange={e => handleChange('colors', { ...content.colors, primary: e.target.value, accent: e.target.value })}
                  />
                  <div className="flex-grow space-y-1">
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                      value={content.colors?.primary || ""}
                      onChange={e => handleChange('colors', { ...content.colors, primary: e.target.value, accent: e.target.value })}
                    />
                    <p className="text-[8px] text-stone-300 uppercase tracking-widest">Влияет на орнаменты, иконки и акценты</p>
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-3">
                <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                  Цвет текста
                  <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.text}</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
                    value={content.colors?.text || "#2d342d"}
                    onChange={e => handleChange('colors', { ...content.colors, text: e.target.value })}
                  />
                  <div className="flex-grow space-y-1">
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                      value={content.colors?.text || ""}
                      onChange={e => handleChange('colors', { ...content.colors, text: e.target.value })}
                    />
                    <p className="text-[8px] text-stone-300 uppercase tracking-widest">Основной цвет заголовков и описаний</p>
                  </div>
                </div>
              </div>

              {/* Hover Color */}
              <div className="space-y-3">
                <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                  Цвет заливки (Hover)
                  <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.hover}</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
                    value={content.colors?.hover || "#2d342d"}
                    onChange={e => handleChange('colors', { ...content.colors, hover: e.target.value })}
                  />
                  <div className="flex-grow space-y-1">
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                      value={content.colors?.hover || ""}
                      onChange={e => handleChange('colors', { ...content.colors, hover: e.target.value })}
                    />
                    <p className="text-[8px] text-stone-300 uppercase tracking-widest">Цвет элементов при наведiи (например, иконки)</p>
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-3">
                <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                  Фон страниц
                  <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.bg}</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
                    value={content.colors?.bg || "#faf7f0"}
                    onChange={e => handleChange('colors', { ...content.colors, bg: e.target.value })}
                  />
                  <div className="flex-grow space-y-1">
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                      value={content.colors?.bg || ""}
                      onChange={e => handleChange('colors', { ...content.colors, bg: e.target.value })}
                    />
                    <p className="text-[8px] text-stone-300 uppercase tracking-widest">Общий фон светлых секций</p>
                  </div>
                </div>
              </div>

              {/* Quote Block Color */}
              <div className="space-y-3">
                <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                  Фон блока цитаты
                  <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.quoteBg}</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
                    value={content.colors?.quoteBg || "#2d342d"}
                    onChange={e => handleChange('colors', { ...content.colors, quoteBg: e.target.value })}
                  />
                  <div className="flex-grow space-y-1">
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                      value={content.colors?.quoteBg || ""}
                      onChange={e => handleChange('colors', { ...content.colors, quoteBg: e.target.value })}
                    />
                    <p className="text-[8px] text-stone-300 uppercase tracking-widest">Цвет «зелёного» квадрата за историей</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'rsvps' ? (
          <div className="space-y-6 pb-20">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 flex justify-between items-center font-sans">
              Списокъ гостей
              <span className="text-stone-400 font-normal">{rsvps.length} подтвержденiй</span>
            </h3>
            
            {isLoadingRsvps ? (
              <div className="flex items-center justify-center py-20 text-stone-300 italic">Загрузка списка...</div>
            ) : rsvps.length === 0 ? (
              <div className="text-center py-20">
                <Users className="mx-auto text-stone-100 mb-4" size={48} />
                <p className="text-stone-300 italic">Гостей пока нѣтъ</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rsvps.map((rsvp: any) => (
                  <div key={rsvp.id} className="p-4 bg-stone-50 rounded-lg border border-stone-100 group hover:border-imperial-gold/30 transition-all text-stone-700">
                    <div className="flex items-start gap-4">
                      {rsvp.avatarUrl && (
                        <img src={rsvp.avatarUrl} className="w-12 h-12 rounded-full border border-stone-200" referrerPolicy="no-referrer" alt="Avatar" />
                      )}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display italic text-lg leading-tight">{rsvp.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {rsvp.attending === 'yes' ? 'Будетъ' : 'Отклонилъ'}
                            </span>
                            <button 
                              onClick={() => handleDeleteRsvp(rsvp.id, rsvp.name)}
                              className="p-1 px-1.5 text-stone-300 hover:text-red-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                              title="Удалить гостя"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">{rsvp.yandexEmail}</p>
                        {rsvp.message && (
                          <div className="mt-3 p-3 bg-white border border-stone-100 rounded text-xs text-stone-600 italic">
                            «{rsvp.message}»
                          </div>
                        )}
                        <p className="text-[8px] text-stone-300 mt-3 uppercase tracking-widest">
                          {new Date(rsvp.timestamp).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'access' ? (
          <div className="space-y-8 pb-20">
            {/* Session Section */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 mb-4 font-sans">
                Текущій сеансъ
              </h3>
              <div className="bg-stone-50 border border-stone-100 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                    <Key size={14} />
                  </div>
                  <div>
                    <h4 className="font-display italic text-base leading-none">denis (Администратор)</h4>
                    <p className="text-[8px] uppercase tracking-widest text-[#22c55e] font-semibold mt-1">Доступ разрешён</p>
                  </div>
                </div>
                
                <button 
                  onClick={onAdminLogout}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 rounded transition-colors cursor-pointer"
                >
                  <LogOut size={12} />
                  Выйти из системы
                </button>
              </div>
            </div>

            {/* Yandex Link Section */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 mb-4 font-sans">
                Интеграція съ Яндекс ID
              </h3>
              
              {yandexUser ? (
                <div className="bg-stone-50 border border-stone-100 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`}
                      className="w-12 h-12 rounded-full border border-stone-200"
                      alt="Yandex Avatar"
                    />
                    <div>
                      <h4 className="font-display italic text-base leading-none">{yandexUser.real_name || yandexUser.display_name}</h4>
                      <p className="text-[9px] text-stone-400 mt-1">Логин: {yandexUser.login}</p>
                    </div>
                  </div>

                  {linkedYandexList.some(u => String(u.yandexId) === String(yandexUser.id)) ? (
                    <div className="flex items-center gap-2 text-[#22c55e] text-xs font-semibold py-2 px-3 bg-green-50 rounded border border-green-100">
                      <Check size={14} />
                      <span>Этот аккаунт привязан к вашей админке</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleLinkYandex}
                      className="w-full bg-[#f33] hover:bg-[#d00] text-white text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 rounded transition-colors cursor-pointer"
                    >
                      <Link2 size={12} />
                      Привязать этот Яндекс ID
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-stone-50 border border-stone-100 rounded-lg p-5 text-center space-y-3">
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    Вы можете войти под своим аккаунтом Яндекс, чтобы привязать его к панели управления. После этого вы сможете логиниться в один клик.
                  </p>
                  <button 
                    onClick={onYandexLogin}
                    className="w-full border border-stone-200 hover:bg-stone-100 text-stone-700 text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 rounded transition-colors cursor-pointer"
                  >
                    Войти в Яндекс
                  </button>
                </div>
              )}
            </div>

            {/* Linked Users List */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 mb-4 font-sans flex justify-between items-center">
                Доверенные профили
                <span className="text-stone-400 font-normal">{linkedYandexList.length} привязано</span>
              </h3>

              {isLoadingLinks ? (
                <div className="text-center py-6 text-stone-300 italic text-xs">Загрузка данных...</div>
              ) : linkedYandexList.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded text-xs text-stone-300 italic">
                  Нет привязанных профилей. Привяжите профиль Яндекс выше, чтобы заходить без ввода логина и пароля.
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedYandexList.map((usr: any) => (
                    <div key={usr.yandexId} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100 hover:border-imperial-gold/20 transition-colors">
                      {usr.avatarUrl && (
                        <img 
                          src={usr.avatarUrl} 
                          className="w-10 h-10 rounded-full border border-stone-200" 
                          alt="Avatar" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-display italic text-sm text-stone-700 truncate leading-none mb-1">{usr.realName || usr.login}</h4>
                        <p className="text-[8px] text-stone-400 uppercase tracking-widest">Логин: {usr.login}</p>
                      </div>
                      <button 
                        onClick={() => handleUnlinkYandex(usr.yandexId)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-stone-400 transition-all flex-shrink-0 cursor-pointer"
                        title="Удалить привязку"
                      >
                        <Unlink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'yandex_config' ? (
          <div className="space-y-8 pb-20">
            <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
              <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest font-sans">Параметры Yandex OAuth</p>
              <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-sans">
                Настройте Client ID и Client Secret своего приложения Yandex OAuth. После этого вход и привязка по клику заработают автоматически на любом устройстве.
              </p>
            </div>

            <section className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold font-sans">Yandex Client ID</label>
                  <input 
                    type="text" 
                    placeholder="Например, 4e74..."
                    className="w-full border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
                    value={yandexClientId}
                    onChange={e => setYandexClientId(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-bold font-sans">Yandex Client Secret</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
                    value={yandexClientSecret}
                    onChange={e => setYandexClientSecret(e.target.value)}
                  />
                </div>
              </div>

              {yandexStatusMessage && (
                <div className={`p-3 text-[11px] rounded font-semibold font-sans ${
                  yandexStatusMessage.includes('успешно') || yandexStatusMessage.includes('благополучно')
                  ? 'bg-green-50 text-green-700 border border-green-100' 
                  : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {yandexStatusMessage}
                </div>
              )}

              <button 
                onClick={handleSaveYandexConfig}
                disabled={isSavingYandex}
                className={`w-full py-3 px-6 rounded-full text-[10px] uppercase tracking-widest font-sans font-bold text-center gap-2 transition-all flex items-center justify-center cursor-pointer ${
                  isSavingYandex 
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-stone-900 text-imperial-gold hover:bg-stone-800 shadow-md'
                }`}
              >
                {isSavingYandex ? 'Сохранение...' : 'Сохранить ключи'}
              </button>
            </section>

            <div className="border-t border-stone-100 pt-6 space-y-3 font-sans">
              <h4 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Инструкция по настройке</h4>
              <ol className="text-[11px] text-stone-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Перейдите в <a href="https://oauth.yandex.ru" target="_blank" rel="noopener noreferrer" className="text-imperial-gold underline hover:text-imperial-gold/80 transition-colors">Яндекс ID OAuth</a> и создайте приложение.</li>
                <li>Выберите пункт <b>«Веб-сервисы»</b> как тип платформы.</li>
                <li>Укажите Redirect URI (поддерживает и localhost для тестов):<br/>
                  <code className="bg-stone-50 text-stone-600 p-1.5 border border-stone-100 rounded text-[9px] font-mono mt-1 block select-all break-all">{window.location.origin}/auth/callback/yandex</code>
                </li>
                <li>Отметьте необходимые права доступа (Scopes) в блоке «Яндекс Паспорт»:
                  <ul className="list-disc list-inside pl-4 mt-1 font-sans text-[10px] text-stone-400 space-y-1">
                    <li>Доступ к адресу электронной почты (<b>email</b>)</li>
                    <li>Доступ к имени, фамилии и полу (<b>info</b>)</li>
                    <li>Доступ к логину, имени и аватару (<b>login</b>)</li>
                  </ul>
                </li>
                <li>Скопируйте полученные <b>ID</b> и <b>Пароль (Secret)</b> и вставьте их на этой вкладке.</li>
              </ol>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-6 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-4">
        <button 
          onClick={onClose}
          className="px-4 py-2 text-stone-400 text-[10px] uppercase tracking-widest hover:text-stone-600"
        >
          Отмена
        </button>
        <button 
          disabled={!hasChanges}
          onClick={handleSave}
          className={`flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
            hasChanges 
            ? 'bg-stone-900 text-imperial-gold hover:bg-stone-800 shadow-lg' 
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
