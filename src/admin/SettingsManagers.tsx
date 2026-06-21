import { useEffect, useState } from 'react';
import { Save, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { db, generateId } from '../lib/db';
import type { TranslationEntry, PaymentMethod } from '../types';

/* ===== SITE SETTINGS MANAGER ===== */
export function SettingsManager() {
  const [settings, setSettings] = useState<any>({
    siteName: '', siteNameAr: '', siteNameSo: '',
    logo: '', favicon: '', tagline: '', taglineAr: '', taglineSo: '',
    seoTitle: '', seoDescription: '', seoKeywords: '',
    defaultLanguage: 'en', enabledLanguages: ['en', 'ar', 'so'],
    whatsappNotificationNumber: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = () => {
      const s = db.getSingle<any>('site_settings');
      if (s) setSettings(s);
    };
    load();
    return db.subscribe('site_settings', load);
  }, []);

  const handleSave = () => {
    db.setSingle('site_settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <div className="card p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Branding</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className="block text-sm font-medium mb-1">Site Name (EN)</label><input type="text" value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Site Name (AR)</label><input type="text" dir="rtl" value={settings.siteNameAr || ''} onChange={e => setSettings({ ...settings, siteNameAr: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Site Name (SO)</label><input type="text" value={settings.siteNameSo || ''} onChange={e => setSettings({ ...settings, siteNameSo: e.target.value })} className="input-field" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Logo URL (transparent PNG)</label><input type="url" value={settings.logo} onChange={e => setSettings({ ...settings, logo: e.target.value })} className="input-field" />{settings.logo && <img src={settings.logo} alt="" className="h-12 mt-2 bg-gray-100 dark:bg-gray-800 p-1 rounded" />}</div>
            <div><label className="block text-sm font-medium mb-1">Favicon URL</label><input type="url" value={settings.favicon} onChange={e => setSettings({ ...settings, favicon: e.target.value })} className="input-field" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className="block text-sm font-medium mb-1">Tagline (EN)</label><input type="text" value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Tagline (AR)</label><input type="text" dir="rtl" value={settings.taglineAr || ''} onChange={e => setSettings({ ...settings, taglineAr: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Tagline (SO)</label><input type="text" value={settings.taglineSo || ''} onChange={e => setSettings({ ...settings, taglineSo: e.target.value })} className="input-field" /></div>
            </div>
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">SEO</h3>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium mb-1">SEO Title</label><input type="text" value={settings.seoTitle} onChange={e => setSettings({ ...settings, seoTitle: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">SEO Description</label><textarea rows={2} value={settings.seoDescription} onChange={e => setSettings({ ...settings, seoDescription: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">SEO Keywords</label><input type="text" value={settings.seoKeywords} onChange={e => setSettings({ ...settings, seoKeywords: e.target.value })} className="input-field" placeholder="keyword1, keyword2, keyword3" /></div>
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
          <div><label className="block text-sm font-medium mb-1">WhatsApp Notification Number</label><input type="tel" value={settings.whatsappNotificationNumber} onChange={e => setSettings({ ...settings, whatsappNotificationNumber: e.target.value })} className="input-field" placeholder="+252..." /><p className="text-xs text-gray-500 mt-1">Receives WhatsApp notifications for new consultations</p></div>
        </div>

        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Language</h3>
          <div><label className="block text-sm font-medium mb-1">Default Language</label><select value={settings.defaultLanguage} onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })} className="input-field max-w-xs"><option value="en">English</option><option value="ar">Arabic</option><option value="so">Somali</option></select></div>
        </div>

        {/* Admin Password Change */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Admin Account</h3>
          <AdminPasswordChange />
        </div>
      </div>
    </div>
  );
}

function AdminPasswordChange() {
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleChange = () => {
    if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters');
    const admins = db.getAll<any>('admin_users');
    if (admins[0]) {
      db.update<any>('admin_users', admins[0].id, { password: newPassword });
      setSaved(true);
      setNewPassword('');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="flex gap-2">
      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field max-w-xs" placeholder="New password (min 6 chars)" />
      <button onClick={handleChange} className="btn-secondary">{saved ? '✓ Changed!' : 'Change Password'}</button>
    </div>
  );
}

/* ===== CONTACT INFO MANAGER ===== */
export function ContactInfoManager() {
  const [contact, setContact] = useState<any>({
    phone: '', email: '', address: '', addressAr: '', addressSo: '',
    whatsapp: '', socialLinks: [], mapEmbed: '',
    workingHours: '', workingHoursAr: '', workingHoursSo: '',
  });
  const [saved, setSaved] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    const load = () => {
      const c = db.getSingle<any>('contact_info');
      if (c) setContact(c);
    };
    load();
    return db.subscribe('contact_info', load);
  }, []);

  const handleSave = () => {
    db.setSingle('contact_info', contact);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSocial = () => {
    if (!newPlatform || !newUrl) return;
    setContact({ ...contact, socialLinks: [...(contact.socialLinks || []), { platform: newPlatform, url: newUrl }] });
    setNewPlatform(''); setNewUrl('');
  };

  const removeSocial = (idx: number) => {
    setContact({ ...contact, socialLinks: contact.socialLinks.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Manager</h1>
        <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save'}</button>
      </div>
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input type="tel" value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} className="input-field" placeholder="+252..." /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="block text-sm font-medium mb-1">Address (EN)</label><input type="text" value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Address (AR)</label><input type="text" dir="rtl" value={contact.addressAr || ''} onChange={e => setContact({ ...contact, addressAr: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Address (SO)</label><input type="text" value={contact.addressSo || ''} onChange={e => setContact({ ...contact, addressSo: e.target.value })} className="input-field" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="block text-sm font-medium mb-1">Working Hours (EN)</label><textarea rows={3} value={contact.workingHours} onChange={e => setContact({ ...contact, workingHours: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Working Hours (AR)</label><textarea rows={3} dir="rtl" value={contact.workingHoursAr || ''} onChange={e => setContact({ ...contact, workingHoursAr: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Working Hours (SO)</label><textarea rows={3} value={contact.workingHoursSo || ''} onChange={e => setContact({ ...contact, workingHoursSo: e.target.value })} className="input-field" /></div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Social Links</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="input-field" placeholder="Platform" />
            <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="input-field flex-1" placeholder="URL" />
            <button onClick={addSocial} className="btn-secondary"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-1">{contact.socialLinks?.map((sl: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded text-sm"><span>{sl.platform}: {sl.url}</span><button onClick={() => removeSocial(i)} className="text-red-500"><X className="w-4 h-4" /></button></div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}

/* ===== THEME MANAGER ===== */
export function ThemeManager() {
  const [theme, setTheme] = useState<any>({
    primaryColor: '#0d9488', mode: 'system', fontFamily: 'system-ui', borderRadius: '0.75rem',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = () => {
      const t = db.getSingle<any>('theme_settings');
      if (t) setTheme(t);
    };
    load();
    return db.subscribe('theme_settings', load);
  }, []);

  const handleSave = () => {
    db.setSingle('theme_settings', theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Manager</h1>
        <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save'}</button>
      </div>
      <div className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Primary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={theme.primaryColor} onChange={e => setTheme({ ...theme, primaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
            <input type="text" value={theme.primaryColor} onChange={e => setTheme({ ...theme, primaryColor: e.target.value })} className="input-field max-w-[150px]" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Default Theme Mode</label>
          <select value={theme.mode} onChange={e => setTheme({ ...theme, mode: e.target.value })} className="input-field max-w-xs">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Font Family</label>
          <select value={theme.fontFamily} onChange={e => setTheme({ ...theme, fontFamily: e.target.value })} className="input-field max-w-xs">
            <option value="system-ui">System Default</option>
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Border Radius</label>
          <select value={theme.borderRadius} onChange={e => setTheme({ ...theme, borderRadius: e.target.value })} className="input-field max-w-xs">
            <option value="0">Sharp (0)</option>
            <option value="0.375rem">Small (0.375rem)</option>
            <option value="0.75rem">Medium (0.75rem)</option>
            <option value="1rem">Large (1rem)</option>
            <option value="1.5rem">Extra Large (1.5rem)</option>
          </select>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Preview: Theme changes are saved for future sessions. Some changes require a page refresh to fully apply.</p>
        </div>
      </div>
    </div>
  );
}

/* ===== TRANSLATION MANAGER ===== */
export function TranslationManager() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => setTranslations(db.getAll<TranslationEntry>('translations'));

  useEffect(() => {
    load();
    return db.subscribe('translations', load);
  }, []);

  const filtered = translations.filter(t =>
    t.key.toLowerCase().includes(search.toLowerCase()) ||
    t.en.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing({ key: '', en: '', ar: '', so: '' }); setShowModal(true); };
  const openEdit = (item: TranslationEntry) => { setEditing({ ...item }); setShowModal(true); };
  const handleSave = () => {
    if (editing?.id) db.update<any>('translations', editing.id, editing);
    else db.add<TranslationEntry>('translations', editing);
    setShowModal(false);
    load();
  };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('translations', id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Translation Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Translation</button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search translations..." className="input-field max-w-xs" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Key</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">English</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Arabic</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Somali</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-4 py-2 font-mono text-xs text-primary-600">{t.key}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-white">{t.en}</td>
                <td className="px-4 py-2 text-gray-500 hidden md:table-cell" dir="rtl">{t.ar}</td>
                <td className="px-4 py-2 text-gray-500 hidden lg:table-cell">{t.so}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-primary-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id ? 'Edit Translation' : 'Add Translation'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div><label className="block text-sm font-medium mb-1">Key</label><input type="text" value={editing.key} onChange={e => setEditing({ ...editing, key: e.target.value })} className="input-field font-mono text-sm" placeholder="nav.home" /></div>
            <div><label className="block text-sm font-medium mb-1">English</label><input type="text" value={editing.en} onChange={e => setEditing({ ...editing, en: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Arabic</label><input type="text" dir="rtl" value={editing.ar} onChange={e => setEditing({ ...editing, ar: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Somali</label><input type="text" value={editing.so} onChange={e => setEditing({ ...editing, so: e.target.value })} className="input-field" /></div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== PAYMENT SETTINGS MANAGER ===== */
export function PaymentManager() {
  const [settings, setSettings] = useState<any>({
    methods: [], currency: 'USD', defaultAmount: 0,
  });
  const [saved, setSaved] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any | null>(null);
  const [showMethodModal, setShowMethodModal] = useState(false);

  const load = () => {
    const s = db.getSingle<any>('payment_settings');
    if (s) setSettings(s);
  };

  useEffect(() => {
    load();
    const unsubPayment = db.subscribe('payment_settings', load);
    const unsubConsultations = db.subscribe('consultations', load);
    return () => {
      unsubPayment();
      unsubConsultations();
    };
  }, []);

  const handleSave = () => {
    db.setSingle('payment_settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openAddMethod = () => {
    setEditingMethod({ id: generateId(), name: '', type: 'evc_plus', number: '', merchantName: '', active: true, instructions: '', instructionsAr: '', instructionsSo: '' });
    setShowMethodModal(true);
  };

  const openEditMethod = (method: PaymentMethod) => { setEditingMethod({ ...method }); setShowMethodModal(true); };

  const saveMethod = () => {
    const methods = [...(settings.methods || [])];
    const idx = methods.findIndex((m: any) => m.id === editingMethod.id);
    if (idx >= 0) methods[idx] = editingMethod;
    else methods.push(editingMethod);
    setSettings({ ...settings, methods });
    setShowMethodModal(false);
  };

  const deleteMethod = (id: string) => {
    setSettings({ ...settings, methods: settings.methods.filter((m: any) => m.id !== id) });
  };

  // Payment transactions from consultations
  const consultations = db.getAll<any>('consultations');
  const paidConsultations = consultations.filter((c: any) => c.paymentDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Manager</h1>
        <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Settings'}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
            <button onClick={openAddMethod} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add Method</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="block text-sm font-medium mb-1">Currency</label><select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="input-field"><option value="USD">USD</option><option value="SOS">SOS</option><option value="SAR">SAR</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Default Amount</label><input type="number" value={settings.defaultAmount} onChange={e => setSettings({ ...settings, defaultAmount: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            </div>
            {settings.methods?.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No payment methods configured</p>}
            {settings.methods?.map((m: any) => (
              <div key={m.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</h3>
                  <p className="text-xs text-gray-500">{m.merchantName} · {m.number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${m.active ? 'badge-paid' : 'badge-archived'}`}>{m.active ? 'Active' : 'Off'}</span>
                  <button onClick={() => openEditMethod(m)} className="text-gray-400 hover:text-primary-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteMethod(m.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>
          {paidConsultations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No payments yet</p>
          ) : (
            <div className="space-y-2">
              {paidConsultations.slice(0, 20).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{c.patientName}</p>
                    <p className="text-xs text-gray-500">{c.paymentMethod} · {c.paymentReference}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${c.paymentAmount}</p>
                    <p className="text-xs text-gray-400">{new Date(c.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Method Modal */}
      {showMethodModal && editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMethodModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h2><button onClick={() => setShowMethodModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={editingMethod.name} onChange={e => setEditingMethod({ ...editingMethod, name: e.target.value })} className="input-field" placeholder="EVC Plus" /></div>
            <div><label className="block text-sm font-medium mb-1">Type</label><select value={editingMethod.type} onChange={e => setEditingMethod({ ...editingMethod, type: e.target.value })} className="input-field"><option value="evc_plus">EVC Plus</option><option value="edahab">eDahab</option><option value="jeeb">Jeeb</option><option value="other">Other</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Phone/Account Number</label><input type="text" value={editingMethod.number} onChange={e => setEditingMethod({ ...editingMethod, number: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Merchant Name</label><input type="text" value={editingMethod.number} onChange={e => setEditingMethod({ ...editingMethod, merchantName: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Instructions (EN)</label><textarea rows={2} value={editingMethod.instructions} onChange={e => setEditingMethod({ ...editingMethod, instructions: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Instructions (AR)</label><textarea rows={2} dir="rtl" value={editingMethod.instructionsAr || ''} onChange={e => setEditingMethod({ ...editingMethod, instructionsAr: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Instructions (SO)</label><textarea rows={2} value={editingMethod.instructionsSo || ''} onChange={e => setEditingMethod({ ...editingMethod, instructionsSo: e.target.value })} className="input-field" /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editingMethod.active} onChange={e => setEditingMethod({ ...editingMethod, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" /> Active</label>
            <div className="flex justify-end gap-3"><button onClick={() => setShowMethodModal(false)} className="btn-secondary">Cancel</button><button onClick={saveMethod} className="btn-primary"><Save className="w-4 h-4" /> Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
