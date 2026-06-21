import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, FileText, HelpCircle,
  MessageSquare, Image, ClipboardList, UserCheck, Pill,
  CreditCard, Phone, Settings, Languages, Palette, Home,
  Menu, X, LogOut, Heart, ChevronDown, ChevronRight, Download, Upload,
  Sun, Moon, Monitor
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../lib/db';

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ]
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/home', icon: Home, label: 'Home Manager' },
      { to: '/admin/doctors', icon: Users, label: 'Doctor Manager' },
      { to: '/admin/services', icon: Stethoscope, label: 'Services Manager' },
      { to: '/admin/blog', icon: FileText, label: 'Blog Manager' },
      { to: '/admin/faq', icon: HelpCircle, label: 'FAQ Manager' },
      { to: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials Manager' },
      { to: '/admin/posters', icon: Image, label: 'Posters Manager' },
    ]
  },
  {
    label: 'Clinical',
    items: [
      { to: '/admin/consultations', icon: ClipboardList, label: 'Consultation Manager' },
      { to: '/admin/patients', icon: UserCheck, label: 'Patients Manager' },
      { to: '/admin/prescriptions', icon: Pill, label: 'Prescriptions Manager' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payments Manager' },
    ]
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/contact', icon: Phone, label: 'Contact Manager' },
      { to: '/admin/settings', icon: Settings, label: 'Settings Manager' },
      { to: '/admin/translations', icon: Languages, label: 'Translation Manager' },
      { to: '/admin/theme', icon: Palette, label: 'Theme Manager' },
    ]
  }
];

function AdminThemeToggle() {
  const { mode, setMode } = useTheme();
  const options: { value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'Auto' },
  ];
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === opt.value
              ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={opt.label}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleExport = () => {
    const data = db.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phc-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const ok = db.importAll(ev.target?.result as string);
          if (ok) {
            alert('Data imported successfully! Refreshing...');
            window.location.reload();
          } else {
            alert('Import failed. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-sm block">PHC Admin</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
        {menuGroups.map(group => (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300"
            >
              {group.label}
              {collapsedGroups.includes(group.label) ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {!collapsedGroups.includes(group.label) && (
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.to, (item as any).exact)
                        ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
        {/* Theme toggle */}
        <AdminThemeToggle />
        <div className="flex gap-1">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={handleImport} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
        </div>
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Home className="w-4 h-4" /> View Site
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-gray-900 dark:text-white text-sm">PHC Admin</span>
        <Link to="/" className="text-sm text-primary-600">View Site</Link>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-gray-900 h-full overflow-hidden">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-3 right-3 p-1 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          {sidebar}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
