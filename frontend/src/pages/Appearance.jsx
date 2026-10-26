import React, { useState, useEffect } from 'react';
import { MdColorLens, MdFormatSize, MdRestore, MdCheck } from 'react-icons/md';
import Wheel from '@uiw/react-color-wheel';
import './Appearance.css';

// Default theme configuration (Clean Enterprise Light Theme)
export const defaultTheme = {
  fontSize: '15px',
  accentColor: '#2563eb',
  bgPrimary: '#f8fafc',
  sidebarBg: '#ffffff',
  textPrimary: '#0f172a'
};

// Helper to compute contrast text color (black vs white)
const getContrastTextColor = (hexColor) => {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  // Calculate relative luminance (YIQ equation)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  // If luminance is >= 140, it is a bright/light/pastel color, so dark text must be used
  return (yiq >= 140) ? '#0f172a' : '#ffffff';
};

// Helper to apply theme to document root
export const applyTheme = (settings) => {
  const root = document.documentElement;
  root.style.setProperty('--base-font-size', settings.fontSize);
  root.style.setProperty('--accent-color', settings.accentColor);
  root.style.setProperty('--bg-primary', settings.bgPrimary);
  root.style.setProperty('--sidebar-bg', settings.sidebarBg);
  root.style.setProperty('--text-primary', settings.textPrimary);

  // Dynamic high-contrast text and border for active sidebar items
  const activeTextColor = getContrastTextColor(settings.accentColor);
  root.style.setProperty('--sidebar-active-bg', settings.accentColor);
  root.style.setProperty('--sidebar-active-text', activeTextColor);
  root.style.setProperty('--sidebar-active-border', activeTextColor === '#0f172a' ? '#0f172a' : '#2563eb');
  
  const isLight = settings.bgPrimary === '#f4f6f9' || settings.bgPrimary === '#ffffff' || settings.bgPrimary === '#f8fafc';
  root.setAttribute('data-theme', isLight ? 'light' : 'dark');
  if (isLight) {
    // Light mode adjustments: Crisp dark text and clear distinct hover & active colors
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-surface', '#f1f5f9');
    root.style.setProperty('--sidebar-bg', '#ffffff');
    root.style.setProperty('--sidebar-header-bg', '#ffffff');
    root.style.setProperty('--sidebar-text', '#334155');
    root.style.setProperty('--sidebar-text-muted', '#64748b');
    root.style.setProperty('--sidebar-icon', '#475569');
    root.style.setProperty('--sidebar-hover', '#f1f5f9');
    root.style.setProperty('--sidebar-active', '#2563eb');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--hover-color', 'rgba(0, 0, 0, 0.03)');
    root.style.setProperty('--menu-hover-text', '#0f172a');
  } else {
    // Dark mode adjustments
    root.style.setProperty('--bg-secondary', '#111827');
    root.style.setProperty('--bg-surface', '#1e293b');
    root.style.setProperty('--sidebar-header-bg', '#090e17');
    root.style.setProperty('--sidebar-text', '#94a3b8');
    root.style.setProperty('--sidebar-text-muted', '#64748b');
    root.style.setProperty('--sidebar-icon', '#64748b');
    root.style.setProperty('--sidebar-hover', '#1e293b');
    root.style.setProperty('--sidebar-active', '#22324e');
    root.style.setProperty('--border-color', '#1e293b');
    root.style.setProperty('--hover-color', 'rgba(255, 255, 255, 0.03)');
    root.style.setProperty('--menu-hover-text', '#ffffff');
  }
};

const Appearance = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('tms_theme_settings');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const [draftSettings, setDraftSettings] = useState(settings);
  const [hexColor, setHexColor] = useState(settings.accentColor);
  const [isApplied, setIsApplied] = useState(false);

  // Keep draft hex color in sync when default resets happen
  useEffect(() => {
    setDraftSettings(settings);
    setHexColor(settings.accentColor);
  }, [settings]);

  const updateDraftSetting = (key, value) => {
    const updated = { ...draftSettings, [key]: value };
    setDraftSettings(updated);
    setSettings(updated);
    applyTheme(updated);
    localStorage.setItem('tms_theme_settings', JSON.stringify(updated));
  };

  const handleColorChange = (color) => {
    setHexColor(color.hex);
    const updated = { ...draftSettings, accentColor: color.hex };
    setDraftSettings(updated);
    setSettings(updated);
    applyTheme(updated);
    localStorage.setItem('tms_theme_settings', JSON.stringify(updated));
  };

  const toggleLightMode = (isLight) => {
    const updated = isLight
      ? { ...draftSettings, bgPrimary: '#f4f6f9', sidebarBg: '#ffffff', textPrimary: '#1e293b' }
      : { ...draftSettings, bgPrimary: '#121212', sidebarBg: '#1a1a24', textPrimary: '#f0f0f0' };
    setDraftSettings(updated);
    setSettings(updated);
    applyTheme(updated);
    localStorage.setItem('tms_theme_settings', JSON.stringify(updated));
  };

  const applyChanges = () => {
    setSettings(draftSettings);
    applyTheme(draftSettings);
    localStorage.setItem('tms_theme_settings', JSON.stringify(draftSettings));
    
    setIsApplied(true);
    setTimeout(() => {
      setIsApplied(false);
    }, 2000);
  };

  const resetToDefault = () => {
    setSettings(defaultTheme);
    applyTheme(defaultTheme);
    localStorage.removeItem('tms_theme_settings');
  };

  return (
    <div className="appearance-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appearance Customizer</h1>
          <p className="page-subtitle">Personalize your workspace colors, fonts, and multi-color themes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={resetToDefault}>
            <MdRestore /> Reset
          </button>
          <button 
            className="btn-primary" 
            onClick={applyChanges}
            style={{ 
              backgroundColor: isApplied ? '#2ed573' : 'var(--accent-color)',
              minWidth: '140px'
            }}
          >
            {isApplied ? <><MdCheck size={18} /> Applied!</> : 'Apply Changes'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <MdFormatSize size={24} color="var(--accent-color)" />
            <h3>Font Size</h3>
          </div>
          <div className="card-body">
            <p>Adjust the global font size for better readability.</p>
            <div className="size-selector">
              <button 
                className={`size-btn ${draftSettings.fontSize === '14px' ? 'active' : ''}`}
                onClick={() => updateDraftSetting('fontSize', '14px')}
                style={{ fontSize: '14px' }}
              >
                Small
              </button>
              <button 
                className={`size-btn ${draftSettings.fontSize === '16px' ? 'active' : ''}`}
                onClick={() => updateDraftSetting('fontSize', '16px')}
                style={{ fontSize: '16px' }}
              >
                Medium (Default)
              </button>
              <button 
                className={`size-btn ${draftSettings.fontSize === '18px' ? 'active' : ''}`}
                onClick={() => updateDraftSetting('fontSize', '18px')}
                style={{ fontSize: '18px' }}
              >
                Large
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <MdColorLens size={24} color="var(--accent-color)" />
            <h3>Theme Color Wheel</h3>
          </div>
          <div className="card-body">
            <p>Spin the arrow to pick any color. The entire application's highlights and buttons will change instantly!</p>
            <div className="wheel-container">
              <Wheel 
                color={hexColor}
                onChange={handleColorChange}
                width={200}
                height={200}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input 
                  type="text" 
                  value={hexColor.toUpperCase()} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setHexColor(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      handleColorChange({ hex: val });
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: hexColor,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textAlign: 'center',
                    width: '110px'
                  }}
                />
              </div>

              {/* Quick Preset Colors */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['#0984e3', '#4facfe', '#00b894', '#d7e396', '#fdcb6e', '#e17055', '#6c5ce7', '#e84393'].map((preset) => (
                  <div
                    key={preset}
                    onClick={() => handleColorChange({ hex: preset })}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: preset,
                      cursor: 'pointer',
                      border: hexColor.toLowerCase() === preset.toLowerCase() ? '2px solid #ffffff' : '2px solid transparent',
                      boxShadow: hexColor.toLowerCase() === preset.toLowerCase() ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card full-width">
          <div className="card-header">
            <MdColorLens size={24} color="var(--accent-color)" />
            <h3>Light / Dark Mode</h3>
          </div>
          <div className="card-body">
            <p>Toggle between the default dark interface and a clean light interface.</p>
            <div className="presets-grid">
              <div 
                className={`preset-card ${draftSettings.bgPrimary === '#121212' ? 'active' : ''}`}
                onClick={() => toggleLightMode(false)}
                style={{ backgroundColor: '#121212', borderColor: '#1a1a24' }}
              >
                <div className="preset-preview" style={{ backgroundColor: '#1a1a24' }}>
                  <div className="preset-accent" style={{ backgroundColor: draftSettings.accentColor }}></div>
                </div>
                <span style={{ color: '#f0f0f0' }}>Dark Mode</span>
              </div>
              <div 
                className={`preset-card ${draftSettings.bgPrimary === '#f4f6f9' ? 'active' : ''}`}
                onClick={() => toggleLightMode(true)}
                style={{ backgroundColor: '#f4f6f9', borderColor: '#ffffff' }}
              >
                <div className="preset-preview" style={{ backgroundColor: '#ffffff' }}>
                  <div className="preset-accent" style={{ backgroundColor: draftSettings.accentColor }}></div>
                </div>
                <span style={{ color: '#1e293b' }}>Light Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
