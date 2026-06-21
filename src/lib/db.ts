// Database layer: Firestore for all collections, with local fallback and real-time sync
// Source of truth is Firestore. Real-time onSnapshot listeners sync to in-memory cache and localStorage.

import { firestore } from './firebase';
import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';

const DB_PREFIX = 'phc_';

// All collections now use Firestore
const FIRESTORE_COLLECTIONS = [
  'doctors', 
  'services', 
  'blog', 
  'faq', 
  'testimonials', 
  'posters', 
  'home_sections', 
  'consultations', 
  'patients', 
  'prescriptions', 
  'payments', 
  'contact_info', 
  'contact_messages', 
  'payment_settings', 
  'site_settings', 
  'theme_settings', 
  'translations', 
  'admin_users'
];

// ---- In-memory cache for Firestore collections ----
const cache = new Map<string, any[]>();

// ---- Subscriber registry: collection -> Set of callbacks ----
const subscribers = new Map<string, Set<() => void>>();

// ---- localStorage helpers ----
function getCollection<T>(collectionName: string): T[] {
  try {
    const data = localStorage.getItem(DB_PREFIX + collectionName);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setCollection<T>(collectionName: string, data: T[]): void {
  localStorage.setItem(DB_PREFIX + collectionName, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ---- Notify all subscribers for a collection ----
function notify(collectionName: string): void {
  const subs = subscribers.get(collectionName);
  if (subs) {
    subs.forEach(cb => {
      try { cb(); } catch (e) { console.error('Subscriber error:', e); }
    });
  }
  window.dispatchEvent(new CustomEvent('db-change', { detail: { collection: collectionName } }));
}

// ---- Initialize Firestore real-time listeners ----
let listenersInitialized = false;

function initFirestoreListeners(): void {
  if (listenersInitialized) return;
  listenersInitialized = true;

  for (const name of FIRESTORE_COLLECTIONS) {
    // Pre-fill cache from localStorage (leftover from previous session)
    cache.set(name, getCollection(name));

    try {
      const colRef = collection(firestore, name);
      onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        cache.set(name, items);
        setCollection(name, items); // persist for offline / next load
        notify(name);
      }, (error) => {
        console.error(`Firestore listener error [${name}]:`, error);
      });
    } catch (error) {
      console.error(`Failed to init listener [${name}]:`, error);
    }
  }
}

// Start listeners at module load
initFirestoreListeners();

// ---- The db object ----
export const db = {
  // ---- READS ----

  getAll<T extends { id: string }>(collectionName: string): T[] {
    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      return (cache.get(collectionName) || []) as T[];
    }
    return getCollection<T>(collectionName);
  },

  getById<T extends { id: string }>(collectionName: string, id: string): T | null {
    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      const items = (cache.get(collectionName) || []) as T[];
      return items.find(item => item.id === id) || null;
    }
    const items = getCollection<T>(collectionName);
    return items.find(item => item.id === id) || null;
  },

  query<T extends { id: string }>(
    collectionName: string,
    filters: Partial<Record<keyof T, any>> = {},
    sort?: { field: keyof T; direction: 'asc' | 'desc' }
  ): T[] {
    let items: T[];
    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      items = [...((cache.get(collectionName) || []) as T[])];
    } else {
      items = getCollection<T>(collectionName);
    }

    for (const [key, value] of Object.entries(filters)) {
      items = items.filter(item => (item as any)[key] === value);
    }

    if (sort) {
      items.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sort.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return items;
  },

  // ---- WRITES ----

  add<T extends { id: string }>(collectionName: string, data: Omit<T, 'id'>): T {
    const id = generateId();
    const now = new Date().toISOString();
    const newItem = { ...data, id, createdAt: now, updatedAt: now } as unknown as T;

    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      const docRef = doc(firestore, collectionName, id);
      const fsData = { ...data, createdAt: now, updatedAt: now };
      setDoc(docRef, fsData).catch(err => console.error('Firestore add error:', err));

      const items = [...(cache.get(collectionName) || []), newItem];
      cache.set(collectionName, items);
      setCollection(collectionName, items);
      notify(collectionName);
      return newItem;
    }

    const items = getCollection<T>(collectionName);
    items.push(newItem);
    setCollection(collectionName, items);
    notify(collectionName);
    return newItem;
  },

  update<T extends { id: string }>(collectionName: string, id: string, data: Partial<T>): T | null {
    const updatedData = { ...data, updatedAt: new Date().toISOString() };

    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      const items = [...(cache.get(collectionName) || [])] as T[];
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...updatedData };
      cache.set(collectionName, items);
      setCollection(collectionName, items);
      notify(collectionName);

      const docRef = doc(firestore, collectionName, id);
      updateDoc(docRef, updatedData as any).catch(err => console.error('Firestore update error:', err));
      return items[index];
    }

    const items = getCollection<T>(collectionName);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updatedData };
    setCollection(collectionName, items);
    notify(collectionName);
    return items[index];
  },

  delete(collectionName: string, id: string): boolean {
    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      const items = (cache.get(collectionName) || []) as any[];
      const filtered = items.filter(item => item.id !== id);
      if (filtered.length === items.length) return false;
      cache.set(collectionName, filtered);
      setCollection(collectionName, filtered);
      notify(collectionName);

      const docRef = doc(firestore, collectionName, id);
      deleteDoc(docRef).catch(err => console.error('Firestore delete error:', err));
      return true;
    }

    const items = getCollection<any>(collectionName);
    const filtered = items.filter((item: any) => item.id !== id);
    if (filtered.length === items.length) return false;
    setCollection(collectionName, filtered);
    notify(collectionName);
    return true;
  },

  set<T>(collectionName: string, id: string, data: T): void {
    const item = { ...data, id, updatedAt: new Date().toISOString() };

    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      const items = [...(cache.get(collectionName) || [])] as any[];
      const index = items.findIndex((i: any) => i.id === id);
      if (index === -1) {
        items.push(item);
      } else {
        items[index] = item;
      }
      cache.set(collectionName, items);
      setCollection(collectionName, items);
      notify(collectionName);

      const docRef = doc(firestore, collectionName, id);
      setDoc(docRef, data as any).catch(err => console.error('Firestore set error:', err));
      return;
    }

    const items = getCollection<any>(collectionName);
    const index = items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      items.push(item);
    } else {
      items[index] = item;
    }
    setCollection(collectionName, items);
    notify(collectionName);
  },

  getSingle<T>(collectionName: string): T | null {
    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      const items = (cache.get(collectionName) || []) as T[];
      return items[0] || null;
    }
    const items = getCollection<T>(collectionName);
    return items[0] || null;
  },

  setSingle<T>(collectionName: string, data: T): void {
    const item = { ...data, id: 'singleton', updatedAt: new Date().toISOString() };

    if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
      cache.set(collectionName, [item]);
      setCollection(collectionName, [item]);
      notify(collectionName);

      const docRef = doc(firestore, collectionName, 'singleton');
      setDoc(docRef, data as any).catch(err => console.error('Firestore setSingle error:', err));
      return;
    }

    setCollection(collectionName, [item]);
    notify(collectionName);
  },

  count(collectionName: string, filters: Record<string, any> = {}): number {
    return this.query(collectionName, filters).length;
  },

  subscribe(collectionName: string, callback: () => void): () => void {
    if (!subscribers.has(collectionName)) {
      subscribers.set(collectionName, new Set());
    }
    subscribers.get(collectionName)!.add(callback);
    return () => {
      subscribers.get(collectionName)?.delete(callback);
    };
  },

  exportAll(): string {
    const allData: Record<string, any> = {};
    const collections = [
      'doctors', 'services', 'consultations', 'patients', 'prescriptions',
      'blog', 'faq', 'testimonials', 'posters', 'home_sections',
      'contact_info', 'contact_messages', 'payment_settings', 'site_settings',
      'theme_settings', 'translations', 'admin_users', 'logs'
    ];
    collections.forEach(c => {
      allData[c] = FIRESTORE_COLLECTIONS.includes(c)
        ? (cache.get(c) || [])
        : getCollection(c);
    });
    return JSON.stringify(allData, null, 2);
  },

  importAll(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      Object.entries(data).forEach(([collectionName, items]) => {
        if (!Array.isArray(items)) return;

        setCollection(collectionName, items as any[]);

        if (FIRESTORE_COLLECTIONS.includes(collectionName)) {
          cache.set(collectionName, items as any[]);

          (items as any[]).forEach((item: any) => {
            const { id, ...rest } = item;
            const docRef = doc(
              firestore,
              collectionName,
              id || generateId()
            );
            setDoc(docRef, rest).catch(console.error);
          });
        }
      });

      return true;
    } catch {
      return false;
    }
  }
};

// ---- Initialize defaults ----
export function initializeDefaults(): void {
  const admins = db.getAll<any>('admin_users');
  if (admins.length === 0) {
    db.add('admin_users', {
      email: 'admin@primehealthconsult.com',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator',
    });
  }

  const settings = db.getSingle<any>('site_settings');
  if (!settings) {
    db.setSingle('site_settings', {
      siteName: 'Prime Health Consult',
      siteNameAr: 'برايم هيلث للاستشارات',
      siteNameSo: 'Prime Health Consult',
      logo: '',
      favicon: '',
      tagline: '',
      taglineAr: '',
      taglineSo: '',
      seoTitle: 'Prime Health Consult',
      seoDescription: '',
      seoKeywords: '',
      defaultLanguage: 'en',
      enabledLanguages: ['en', 'ar', 'so'],
      whatsappNotificationNumber: '',
    });
  }

  const theme = db.getSingle<any>('theme_settings');
  if (!theme) {
    db.setSingle('theme_settings', {
      primaryColor: '#0d9488',
      mode: 'system',
      fontFamily: 'system-ui',
      borderRadius: '0.75rem',
    });
  }

  const payment = db.getSingle<any>('payment_settings');
  if (!payment) {
    db.setSingle('payment_settings', {
      methods: [],
      currency: 'USD',
      defaultAmount: 0,
    });
  }

  const contact = db.getSingle<any>('contact_info');
  if (!contact) {
    db.setSingle('contact_info', {
      phone: '',
      email: '',
      address: '',
      addressAr: '',
      addressSo: '',
      whatsapp: '',
      socialLinks: [],
      mapEmbed: '',
      workingHours: '',
      workingHoursAr: '',
      workingHoursSo: '',
    });
  }

  const translations = db.getAll<any>('translations');
  if (translations.length === 0) {
    const defaultTranslations = [
      { key: 'nav.home', en: 'Home', ar: 'الرئيسية', so: 'Bogga Hore' },
      { key: 'nav.doctors', en: 'Doctors', ar: 'الأطباء', so: 'Dhakhaatiirta' },
      { key: 'nav.services', en: 'Services', ar: 'الخدمات', so: 'Adeegyada' },
      { key: 'nav.blog', en: 'Blog', ar: 'المدونة', so: 'Maqaallada' },
      { key: 'nav.contact', en: 'Contact', ar: 'اتصل بنا', so: 'Nala Soo Xiriir' },
      { key: 'nav.faq', en: 'FAQ', ar: 'الأسئلة الشائعة', so: "Su'aalaha" },
      { key: 'nav.consultation', en: 'Book Consultation', ar: 'حجز استشارة', so: 'La-tashi Dalbo' },
      { key: 'common.readMore', en: 'Read More', ar: 'اقرأ المزيد', so: 'Akhri Dheeraad' },
      { key: 'common.submit', en: 'Submit', ar: 'إرسال', so: 'Dir' },
      { key: 'common.loading', en: 'Loading...', ar: 'جاري التحميل...', so: 'Soo dejinayaa...' },
      { key: 'common.noData', en: 'No data available', ar: 'لا توجد بيانات', so: 'Macluumaad la heli maayo' },
      { key: 'common.search', en: 'Search', ar: 'بحث', so: 'Raadi' },
      { key: 'common.save', en: 'Save', ar: 'حفظ', so: 'Kaydi' },
      { key: 'common.cancel', en: 'Cancel', ar: 'إلغاء', so: 'Jooji' },
      { key: 'common.delete', en: 'Delete', ar: 'حذف', so: 'Tirtir' },
      { key: 'common.edit', en: 'Edit', ar: 'تعديل', so: 'Wax ka beddel' },
      { key: 'common.add', en: 'Add', ar: 'إضافة', so: 'Kudar' },
      { key: 'common.back', en: 'Back', ar: 'رجوع', so: 'Dib u noqo' },
      { key: 'common.comingSoon', en: 'Coming Soon', ar: 'قريباً', so: 'Dhowaan' },
      { key: 'form.name', en: 'Full Name', ar: 'الاسم الكامل', so: 'Magaca Buuxa' },
      { key: 'form.age', en: 'Age', ar: 'العمر', so: 'Da\'da' },
      { key: 'form.gender', en: 'Gender', ar: 'الجنس', so: 'Jinsiga' },
      { key: 'form.male', en: 'Male', ar: 'ذكر', so: 'Lab' },
      { key: 'form.female', en: 'Female', ar: 'أنثى', so: 'Dheddig' },
      { key: 'form.country', en: 'Country', ar: 'البلد', so: 'Dalka' },
      { key: 'form.whatsapp', en: 'WhatsApp Number', ar: 'رقم الواتساب', so: 'Lambarka WhatsApp' },
      { key: 'form.height', en: 'Height (cm)', ar: 'الطول (سم)', so: 'Dhererka (cm)' },
      { key: 'form.weight', en: 'Weight (kg)', ar: 'الوزن (كجم)', so: 'Miisaanka (kg)' },
      { key: 'form.allergies', en: 'Allergies', ar: 'الحساسية', so: 'Xasaasiyadda' },
      { key: 'form.medications', en: 'Current Medications', ar: 'الأدوية الحالية', so: 'Daawoyinka Hadda' },
      { key: 'form.pastDiseases', en: 'Past Diseases', ar: 'الأمراض السابقة', so: 'Cudurradii Hore' },
      { key: 'form.symptoms', en: 'Symptoms', ar: 'الأعراض', so: 'Calaamadaha' },
      { key: 'form.duration', en: 'Duration', ar: 'المدة', so: 'Muddada' },
      { key: 'form.attachments', en: 'Attachments', ar: 'المرفقات', so: 'Lifaaqyada' },
      { key: 'form.selectService', en: 'Select Service', ar: 'اختر الخدمة', so: 'Dooro Adeegga' },
      { key: 'form.selectDoctor', en: 'Select Doctor', ar: 'اختر الطبيب', so: 'Dooro Dhakhtarka' },
      { key: 'consultation.submitted', en: 'Consultation request submitted successfully!', ar: 'تم إرسال طلب الاستشارة بنجاح!', so: 'Codsiga la-talinta si guul leh ayaa loo diray!' },
      { key: 'consultation.status', en: 'Status', ar: 'الحالة', so: 'Xaalada' },
      { key: 'payment.title', en: 'Payment', ar: 'الدفع', so: 'Lacag bixinta' },
      { key: 'payment.amount', en: 'Amount', ar: 'المبلغ', so: 'Qadarka' },
      { key: 'payment.method', en: 'Payment Method', ar: 'طريقة الدفع', so: 'Habka Lacag bixinta' },
      { key: 'payment.reference', en: 'Transaction Reference', ar: 'رقم المعاملة', so: 'Tixraaca Macaamiilka' },
      { key: 'payment.confirm', en: 'Confirm Payment', ar: 'تأكيد الدفع', so: 'Xaqiiji Lacag bixinta' },
      { key: 'footer.rights', en: 'All rights reserved', ar: 'جميع الحقوق محفوظة', so: 'Dhammaan xuquuqda way xifdisan yihiin' },
    ];
    defaultTranslations.forEach(t => db.add('translations', t));
  }
}

