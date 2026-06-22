import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { db } from '../lib/db';
import type { BlogPost, FAQItem, Testimonial, Poster, HomeSection, ContactMessage } from '../types';

/* ===== GENERIC CRUD MODAL PATTERN ===== */
function AdminModal({ show, onClose, title, children, onSave }: {
  show: boolean; onClose: () => void; title: string; children: React.ReactNode; onSave: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onSave} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>
    </div>
  );
}

function LangInputs({ label, value, valueAr, valueSo, onChange, textarea }: {
  label: string; value: string; valueAr?: string; valueSo?: string;
  onChange: (field: string, val: string) => void; textarea?: boolean;
}) {
  const Input = textarea ? 'textarea' : 'input';
  const props = textarea ? { rows: 3 } : {};
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (EN)</label>
        <Input {...(props as any)} type={textarea ? undefined : "text"} value={value} onChange={(e: any) => onChange('', e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (AR)</label>
        <Input {...(props as any)} type={textarea ? undefined : "text"} dir="rtl" value={valueAr || ''} onChange={(e: any) => onChange('Ar', e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (SO)</label>
        <Input {...(props as any)} type={textarea ? undefined : "text"} value={valueSo || ''} onChange={(e: any) => onChange('So', e.target.value)} className="input-field" />
      </div>
    </div>
  );
}

/* ===== BLOG MANAGER ===== */
export function BlogManager() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const load = () => setItems(db.query<BlogPost>('blog', {}, { field: 'createdAt', direction: 'desc' }));
  useEffect(() => { load(); return db.subscribe('blog', load); }, []);

  const openAdd = () => { setEditing({ title: '', titleAr: '', titleSo: '', content: '', contentAr: '', contentSo: '', excerpt: '', excerptAr: '', excerptSo: '', image: '', author: '', tags: [], published: true }); setShowModal(true); };
  const openEdit = (item: BlogPost) => { setEditing({ ...item }); setShowModal(true); };
  const handleSave = () => { if (editing?.id) db.update<any>('blog', editing.id, editing); else db.add<BlogPost>('blog', editing); setShowModal(false); load(); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('blog', id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Post</button>
      </div>
      {items.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">📝</span><p className="text-gray-500 mb-4">No blog posts yet</p><button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add First Post</button></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              {item.image && <img src={item.image} alt="" className="w-16 h-12 rounded object-cover shrink-0 hidden sm:block" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-500">{item.author} · {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`badge ${item.published ? 'badge-paid' : 'badge-archived'}`}>{item.published ? 'Published' : 'Draft'}</span>
              <button onClick={() => openEdit(item)} className="btn-secondary text-xs py-1.5 px-2"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(item.id)} className="btn-danger text-xs py-1.5 px-2"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      <AdminModal show={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'Edit Post' : 'Add Post'} onSave={handleSave}>
        {editing && (<>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label><input type="url" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} className="input-field" /></div>
          <LangInputs label="Title" value={editing.title} valueAr={editing.titleAr} valueSo={editing.titleSo} onChange={(s, v) => setEditing({ ...editing, ['title' + s]: v })} />
          <LangInputs label="Excerpt" value={editing.excerpt} valueAr={editing.excerptAr} valueSo={editing.excerptSo} onChange={(s, v) => setEditing({ ...editing, ['excerpt' + s]: v })} textarea />
          <LangInputs label="Content" value={editing.content} valueAr={editing.contentAr} valueSo={editing.contentSo} onChange={(s, v) => setEditing({ ...editing, ['content' + s]: v })} textarea />
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label><input type="text" value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label><input type="text" value={editing.tags?.join(', ')} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })} className="input-field" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} className="rounded text-primary-600" /> Published</label>
        </>)}
      </AdminModal>
    </div>
  );
}

/* ===== FAQ MANAGER ===== */
export function FAQManager() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const load = () => setItems(db.query<FAQItem>('faq', {}, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('faq', load); }, []);

  const openAdd = () => { setEditing({ question: '', questionAr: '', questionSo: '', answer: '', answerAr: '', answerSo: '', order: items.length, active: true }); setShowModal(true); };
  const openEdit = (item: FAQItem) => { setEditing({ ...item }); setShowModal(true); };
  const handleSave = () => { if (editing?.id) db.update<any>('faq', editing.id, editing); else db.add<FAQItem>('faq', editing); setShowModal(false); load(); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('faq', id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add FAQ</button>
      </div>
      {items.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">❓</span><p className="text-gray-500 mb-4">No FAQ items yet</p><button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add First FAQ</button></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0"><h3 className="font-medium text-gray-900 dark:text-white truncate">{item.question || 'Untitled'}</h3></div>
              <span className={`badge ${item.active ? 'badge-paid' : 'badge-archived'}`}>{item.active ? 'Active' : 'Hidden'}</span>
              <button onClick={() => openEdit(item)} className="btn-secondary text-xs py-1.5 px-2"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(item.id)} className="btn-danger text-xs py-1.5 px-2"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      <AdminModal show={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'Edit FAQ' : 'Add FAQ'} onSave={handleSave}>
        {editing && (<>
          <LangInputs label="Question" value={editing.question} valueAr={editing.questionAr} valueSo={editing.questionSo} onChange={(s, v) => setEditing({ ...editing, ['question' + s]: v })} />
          <LangInputs label="Answer" value={editing.answer} valueAr={editing.answerAr} valueSo={editing.answerSo} onChange={(s, v) => setEditing({ ...editing, ['answer' + s]: v })} textarea />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Order</label><input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" /> Active</label></div>
          </div>
        </>)}
      </AdminModal>
    </div>
  );
}

/* ===== TESTIMONIALS MANAGER ===== */
export function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const load = () => setItems(db.query<Testimonial>('testimonials', {}, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('testimonials', load); }, []);

  const openAdd = () => { setEditing({ name: '', nameAr: '', nameSo: '', content: '', contentAr: '', contentSo: '', photo: '', rating: 5, active: true, order: items.length }); setShowModal(true); };
  const openEdit = (item: Testimonial) => { setEditing({ ...item }); setShowModal(true); };
  const handleSave = () => { if (editing?.id) db.update<any>('testimonials', editing.id, editing); else db.add<Testimonial>('testimonials', editing); setShowModal(false); load(); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('testimonials', id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Testimonial</button>
      </div>
      {items.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">💬</span><p className="text-gray-500 mb-4">No testimonials yet</p><button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add First Testimonial</button></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start gap-3 mb-2">
                {item.photo ? <img src={item.photo} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">💬</div>}
                <div><h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3><p className="text-xs text-yellow-500">{'⭐'.repeat(item.rating)}</p></div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">"{item.content}"</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="btn-secondary flex-1 text-xs py-1.5"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(item.id)} className="btn-danger flex-1 text-xs py-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AdminModal show={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'Edit Testimonial' : 'Add Testimonial'} onSave={handleSave}>
        {editing && (<>
          <div><label className="block text-sm font-medium mb-1">Photo URL</label><input type="url" value={editing.photo} onChange={e => setEditing({ ...editing, photo: e.target.value })} className="input-field" /></div>
          <LangInputs label="Name" value={editing.name} valueAr={editing.nameAr} valueSo={editing.nameSo} onChange={(s, v) => setEditing({ ...editing, ['name' + s]: v })} />
          <LangInputs label="Content" value={editing.content} valueAr={editing.contentAr} valueSo={editing.contentSo} onChange={(s, v) => setEditing({ ...editing, ['content' + s]: v })} textarea />
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Rating</label><input type="number" min="1" max="5" value={editing.rating} onChange={e => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Order</label><input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" /> Active</label></div>
          </div>
        </>)}
      </AdminModal>
    </div>
  );
}

/* ===== POSTERS MANAGER ===== */
export function PosterManager() {
  const [items, setItems] = useState<Poster[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const load = () => setItems(db.query<Poster>('posters', {}, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('posters', load); }, []);

  const openAdd = () => { setEditing({ title: '', titleAr: '', titleSo: '', image: '', link: '', active: true, order: items.length }); setShowModal(true); };
  const openEdit = (item: Poster) => { setEditing({ ...item }); setShowModal(true); };
  const handleSave = () => { if (editing?.id) db.update<any>('posters', editing.id, editing); else db.add<Poster>('posters', editing); setShowModal(false); load(); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('posters', id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posters Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Poster</button>
      </div>
      {items.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">🖼️</span><p className="text-gray-500 mb-4">No posters yet</p><button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add First Poster</button></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card">
              {item.image && <img src={item.image} alt="" className="aspect-[4/5] w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.title || 'Untitled'}</h3>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(item)} className="btn-secondary flex-1 text-xs py-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="btn-danger flex-1 text-xs py-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AdminModal show={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'Edit Poster' : 'Add Poster'} onSave={handleSave}>
        {editing && (<>
          <div><label className="block text-sm font-medium mb-1">Image URL (4:5 ratio recommended)</label><input type="url" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} className="input-field" /></div>
          {editing.image && <img src={editing.image} alt="" className="w-40 aspect-[4/5] object-cover rounded" />}
          <LangInputs label="Title" value={editing.title} valueAr={editing.titleAr} valueSo={editing.titleSo} onChange={(s, v) => setEditing({ ...editing, ['title' + s]: v })} />
          <div><label className="block text-sm font-medium mb-1">Link URL</label><input type="url" value={editing.link || ''} onChange={e => setEditing({ ...editing, link: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Order</label><input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" /> Active</label></div>
          </div>
        </>)}
      </AdminModal>
    </div>
  );
}

/* ===== HOME MANAGER ===== */
export function HomeManager() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const load = () => setSections(db.query<HomeSection>('home_sections', {}, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('home_sections', load); }, []);

  const openAdd = () => { setEditing({ type: 'hero', title: '', titleAr: '', titleSo: '', subtitle: '', subtitleAr: '', subtitleSo: '', content: '', contentAr: '', contentSo: '', image: '', buttonText: '', buttonTextAr: '', buttonTextSo: '', buttonLink: '', active: true, order: sections.length }); setShowModal(true); };
  const openEdit = (item: HomeSection) => { setEditing({ ...item }); setShowModal(true); };
  const handleSave = () => { if (editing?.id) db.update<any>('home_sections', editing.id, editing); else db.add<HomeSection>('home_sections', editing); setShowModal(false); load(); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('home_sections', id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Section</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Manage hero banners, CTAs, and custom sections on your homepage. Services, doctors, testimonials, and posters are automatically shown from their respective managers.</p>
      {sections.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">🏠</span><p className="text-gray-500 mb-4">No home sections yet</p><button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Hero Section</button></div>
      ) : (
        <div className="space-y-3">
          {sections.map(s => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/30 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg">{s.type === 'hero' ? '🎯' : s.type === 'cta' ? '📢' : '📋'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{s.title || s.type}</h3>
                <p className="text-xs text-gray-500">Type: {s.type} · Order: {s.order}</p>
              </div>
              <span className={`badge ${s.active ? 'badge-paid' : 'badge-archived'}`}>{s.active ? 'Active' : 'Hidden'}</span>
              <button onClick={() => openEdit(s)} className="btn-secondary text-xs py-1.5 px-2"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(s.id)} className="btn-danger text-xs py-1.5 px-2"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      <AdminModal show={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'Edit Section' : 'Add Section'} onSave={handleSave}>
        {editing && (<>
          <div><label className="block text-sm font-medium mb-1">Section Type</label><select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="input-field"><option value="hero">Hero Banner</option><option value="cta">Call to Action</option><option value="custom">Custom Content</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Image URL (16:9 for banner)</label><input type="url" value={editing.image || ''} onChange={e => setEditing({ ...editing, image: e.target.value })} className="input-field" /></div>
          <LangInputs label="Title" value={editing.title} valueAr={editing.titleAr} valueSo={editing.titleSo} onChange={(s, v) => setEditing({ ...editing, ['title' + s]: v })} />
          <LangInputs label="Subtitle" value={editing.subtitle || ''} valueAr={editing.subtitleAr} valueSo={editing.subtitleSo} onChange={(s, v) => setEditing({ ...editing, ['subtitle' + s]: v })} />
          {editing.type === 'custom' && <LangInputs label="Content" value={editing.content || ''} valueAr={editing.contentAr} valueSo={editing.contentSo} onChange={(s, v) => setEditing({ ...editing, ['content' + s]: v })} textarea />}
          <LangInputs label="Button Text" value={editing.buttonText || ''} valueAr={editing.buttonTextAr} valueSo={editing.buttonTextSo} onChange={(s, v) => setEditing({ ...editing, ['buttonText' + s]: v })} />
          <div><label className="block text-sm font-medium mb-1">Button Link</label><input type="text" value={editing.buttonLink || ''} onChange={e => setEditing({ ...editing, buttonLink: e.target.value })} className="input-field" placeholder="/consultation" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Order</label><input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" /> Active</label></div>
          </div>
        </>)}
      </AdminModal>
    </div>
  );
}

/* ===== CONTACT MESSAGES MANAGER ===== */
export function ContactManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const load = () => setMessages(db.query<ContactMessage>('contact_messages', {}, { field: 'createdAt', direction: 'desc' }));
  useEffect(() => { load(); return db.subscribe('contact_messages', load); }, []);

  const markRead = (id: string) => { db.update<any>('contact_messages', id, { read: true }); load(); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('contact_messages', id); load(); setSelected(null); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
        <span className="badge badge-pending">{messages.filter(m => !m.read).length} unread</span>
      </div>
      {messages.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">📬</span><p className="text-gray-500">No messages yet</p></div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${!msg.read ? 'border-l-4 border-l-primary-600' : ''}`} onClick={() => { setSelected(msg); markRead(msg.id); }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{msg.name}</h3>
                  <p className="text-sm text-gray-500">{msg.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</p>
                  {!msg.read && <span className="badge badge-pending text-xs mt-1">New</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (

    <div
      className="fixed inset-0 bg-black/50"
      onClick={() => setSelected(null)}
    /><div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl p-6">
  <div className="flex justify-between mb-4">
    <h2 className="text-lg font-semibold">Message Details</h2>
  </div>

  <div className="space-y-3 text-sm">
    <p>
      <span className="font-medium">From:</span> {selected.name}
    </p>

    <p>
      <span className="font-medium">Email:</span>{" "}
      <a
        href={`mailto:${selected.email}`}
        className="text-primary-600"
      >
        {selected.email}
      </a>
    </p>

    {selected.phone && (
      <p>
        <span className="font-medium">Phone:</span> {selected.phone}
      </p>
    )}

    <p>
      <span className="font-medium">Date:</span>{" "}
      {new Date(selected.createdAt).toLocaleString()}
    </p>

    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
      {selected.message}
    </div>
  </div>

  <div className="flex gap-2 mt-4">
    <a

`Hello ${selected.name},

Thank you for contacting Prime Health Consult.

Subject:
${selected.subject}

Your message:
${selected.message}

Dr. Qaahir has reviewed your message and is replying to you.

Best regards,
Prime Health Consult" )}"}href={`https://wa.me/${selected.phone?.replace(/\D/g, "")}?text=${encodeURIComp>

`Hello ${selected.name},

Thank you for contacting Prime Health Consult.

Subject:
${selected.subject}

Your message:
${selected.message}

Dr. Qaahir has reviewed your message and is replying to you.

Best regards,
Prime Health Consult" )}"}
target="_blank"
rel="noopener noreferrer"
className="btn-primary flex-1"
>
Reply
</a>

    <button
      onClick={() => handleDelete(selected.id)}
      className="btn-danger"
    >
      Delete
    </button>
  </div>
</div>

  </div>
)}
  );
}<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="fixed inset-0 bg-black/50"
      onClick={() => setSelected(null)}
    />

    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Message Details</h2>
      </div>

      <div className="space-y-3 text-sm">
        <p>
          <span className="font-medium">From:</span> {selected.name}
        </p>

        <p>
          <span className="font-medium">Email:</span>{" "}
          <a
            href={`mailto:${selected.email}`}
            className="text-primary-600"
          >
            {selected.email}
          </a>
        </p>

        {selected.phone && (
          <p>
            <span className="font-medium">Phone:</span> {selected.phone}
          </p>
        )}

        <p>
          <span className="font-medium">Date:</span>{" "}
          {new Date(selected.createdAt).toLocaleString()}
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
          {selected.message}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <a
          href={`https://wa.me/${selected.phone?.replace(
            /\D/g,
            ""
          )}?text=${encodeURIComponent(
            `Hello ${selected.name},

Thank you for contacting Prime Health Consult.

Subject:
${selected.subject}

Your message:
${selected.message}

Dr. Qaahir has reviewed your message and is replying to you.

Best regards,
Prime Health Consult`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1"
        >
          Reply
        </a>

        <button
          onClick={() => handleDelete(selected.id)}
          className="btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
);
}
