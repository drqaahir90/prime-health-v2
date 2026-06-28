import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, Globe, ChevronDown, Phone, Mail, Heart, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../lib/db';
import type { SiteSettings, ContactInfo } from '../types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const { mode, setMode } = useTheme();
  const { lang, setLang, t, isRTL, languages } = useLanguage();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const load = () => {
    setSettings(db.getSingle<SiteSettings>('site_settings'));
    setContact(db.getSingle<ContactInfo>('contact_info'));
  };

  useEffect(() => {
    load();
    const unsubSiteSettings = db.subscribe('site_settings', load);
    const unsubContact = db.subscribe('contact_info', load);
    return () => {
      unsubSiteSettings();
      unsubContact();
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home') },
    { to: '/doctors', label: t('nav.doctors', 'Doctors') },
    { to: '/services', label: t('nav.services', 'Services') },
    { to: '/blog', label: t('nav.blog', 'Blog') },
    { to: '/faq', label: t('nav.faq', 'FAQ') },
    { to: '/contact', label: t('nav.contact', 'Contact') },
  ];

  const siteName = lang === 'ar' ? settings?.siteNameAr : lang === 'so' ? settings?.siteNameSo : settings?.siteName;

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  const currentThemeIcon = mode === 'light' ? <Sun className="w-5 h-5" /> : mode === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      {(contact?.phone || contact?.email) && (
        <div className="bg-primary-700 text-white text-xs py-1.5 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary-200">
                  <Phone className="w-3 h-3" /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary-200">
                  <Mail className="w-3 h-3" /> {contact.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              {contact?.socialLinks?.map((sl, i) => (
                <a key={i} href={sl.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-200">
                  {sl.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              {settings?.logo ? (
                <img src={settings.logo} alt={siteName || ''} className="h-9 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" fill="white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                    {siteName || 'Prime Health Consult'}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {/* Theme dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setThemeOpen(!themeOpen); setLangOpen(false); }}
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title={`Theme: ${mode}`}
                >
                  {currentThemeIcon}
                </button>
                {themeOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-[160px]`}>
                      {themeOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setMode(opt.value); setThemeOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            mode === opt.value
                              ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/50 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className={mode === opt.value ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}>{opt.icon}</span>
                          <span className="flex-1 text-left">{opt.label}</span>
                          {mode === opt.value && <Check className="w-4 h-4 text-primary-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Language dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setLangOpen(!langOpen); setThemeOpen(false); }}
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm"
                >
                  <Globe className="w-5 h-5" />
                  <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-[160px]`}>
                      {languages.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            lang === l.code
                              ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/50 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="flex-1 text-left">{l.label}</span>
                          {lang === l.code && <Check className="w-4 h-4 text-primary-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* CTA button */}
              <Link
                to="/consultation"
                className="btn-primary hidden sm:inline-flex text-xs px-3 py-2"
              >
                {t('nav.consultation', 'Book Consultation')}
              </Link>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                    location.pathname === link.to
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile theme switcher */}
              <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme</p>
                <div className="flex gap-2 px-3">
                  {themeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        mode === opt.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/consultation"
                className="block w-full btn-primary text-center mt-3"
              >
                {t('nav.consultation', 'Book Consultation')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="text-white font-bold">{siteName || 'Prime Health Consult'}</span>
              </div>
              {settings?.tagline && (
                <p className="text-sm">
                  {lang === 'ar' ? settings.taglineAr : lang === 'so' ? settings.taglineSo : settings.tagline}
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">{t('nav.home', 'Quick Links')}</h3>
              <ul className="space-y-2 text-sm">
                {navLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-primary-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">{t('nav.contact', 'Contact')}</h3>
              <ul className="space-y-2 text-sm">
                {contact?.phone && (
                  <li><a href={`tel:${contact.phone}`} className="hover:text-primary-400">{contact.phone}</a></li>
                )}
                {contact?.email && (
                  <li><a href={`mailto:${contact.email}`} className="hover:text-primary-400">{contact.email}</a></li>
                )}
                {contact?.whatsapp && (
                  <li><a href={`https://wa.me/${contact.whatsapp}`} className="hover:text-primary-400">WhatsApp</a></li>
                )}
                {contact?.address && (
                  <li>{lang === 'ar' ? contact.addressAr : lang === 'so' ? contact.addressSo : contact.address}</li>
                )}
              </ul>
            </div>

            {/* Working Hours */}
            <div>
              {contact?.workingHours && (
                <>
                  <h3 className="text-white font-semibold mb-4">
                    {lang === 'ar' ? 'ساعات العمل' : lang === 'so' ? 'Saacadaha Shaqada' : 'Working Hours'}
                  </h3>
                  <p className="text-sm whitespace-pre-line">
                    {lang === 'ar' ? contact.workingHoursAr : lang === 'so' ? contact.workingHoursSo : contact.workingHours}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} {siteName || 'Prime Health Consult'}. {t('footer.rights', 'All rights reserved')}</p>
            <Link to="/admin/login" className="text-gray-500 hover:text-primary-400 transition-colors">
              
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
