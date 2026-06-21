export interface Doctor {
  id: string;
  name: string;
  nameAr?: string;
  nameSo?: string;
  photo: string;
  qualification: string;
  qualificationAr?: string;
  qualificationSo?: string;
  position: string;
  positionAr?: string;
  positionSo?: string;
  biography: string;
  biographyAr?: string;
  biographySo?: string;
  certificates: string[];
  serviceIds: string[];
  socialLinks: { platform: string; url: string }[];
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  nameAr?: string;
  nameSo?: string;
  description: string;
  descriptionAr?: string;
  descriptionSo?: string;
  icon: string;
  image: string;
  price: number;
  currency: string;
  formFields: FormField[];
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  label: string;
  labelAr?: string;
  labelSo?: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file' | 'date';
  options?: string[];
  required: boolean;
  order: number;
}

export interface Consultation {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  country: string;
  whatsapp: string;
  height?: string;
  weight?: string;
  allergies?: string;
  currentMedications?: string;
  pastDiseases?: string;
  symptoms: string;
  duration?: string;
  attachments: string[];
  serviceId: string;
  doctorId: string;
  customFields: Record<string, any>;
  status: ConsultationStatus;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  clinicalNotes?: string;
  prescription?: string;
  followUpDate?: string;
  followUpType?: 'temporary' | 'long-term';
  createdAt: string;
  updatedAt: string;
}

export type ConsultationStatus = 'pending' | 'accepted' | 'rejected' | 'payment_requested' | 'paid' | 'in_progress' | 'follow_up' | 'completed' | 'archived';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  whatsapp: string;
  consultationIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientName: string;
  doctorId: string;
  medications: { name: string; dosage: string; frequency: string; duration: string; notes: string }[];
  notes: string;
  renewDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleAr?: string;
  titleSo?: string;
  content: string;
  contentAr?: string;
  contentSo?: string;
  excerpt: string;
  excerptAr?: string;
  excerptSo?: string;
  image: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionAr?: string;
  questionSo?: string;
  answer: string;
  answerAr?: string;
  answerSo?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  nameAr?: string;
  nameSo?: string;
  content: string;
  contentAr?: string;
  contentSo?: string;
  photo: string;
  rating: number;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Poster {
  id: string;
  title: string;
  titleAr?: string;
  titleSo?: string;
  image: string;
  link?: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomeSection {
  id: string;
  type: 'hero' | 'services' | 'doctors' | 'testimonials' | 'posters' | 'cta' | 'stats' | 'custom';
  title: string;
  titleAr?: string;
  titleSo?: string;
  subtitle?: string;
  subtitleAr?: string;
  subtitleSo?: string;
  content?: string;
  contentAr?: string;
  contentSo?: string;
  image?: string;
  buttonText?: string;
  buttonTextAr?: string;
  buttonTextSo?: string;
  buttonLink?: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  address: string;
  addressAr?: string;
  addressSo?: string;
  whatsapp: string;
  socialLinks: { platform: string; url: string }[];
  mapEmbed?: string;
  workingHours: string;
  workingHoursAr?: string;
  workingHoursSo?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PaymentSettings {
  id: string;
  methods: PaymentMethod[];
  currency: string;
  defaultAmount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'evc_plus' | 'edahab' | 'jeeb' | 'other';
  number: string;
  merchantName: string;
  active: boolean;
  instructions: string;
  instructionsAr?: string;
  instructionsSo?: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteNameAr?: string;
  siteNameSo?: string;
  logo: string;
  favicon: string;
  tagline: string;
  taglineAr?: string;
  taglineSo?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  defaultLanguage: 'en' | 'ar' | 'so';
  enabledLanguages: string[];
  whatsappNotificationNumber: string;
}

export interface ThemeSettings {
  id: string;
  primaryColor: string;
  mode: 'light' | 'dark' | 'system';
  fontFamily: string;
  borderRadius: string;
}

export type Language = 'en' | 'ar' | 'so';

export interface TranslationEntry {
  id: string;
  key: string;
  en: string;
  ar: string;
  so: string;
}
