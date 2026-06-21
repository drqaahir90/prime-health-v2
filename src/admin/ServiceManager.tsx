import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { db, generateId } from '../lib/db';
import type { Service, FormField } from '../types';

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => setServices(db.query<Service>('services', {}, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('services', load); }, []);

  const openAdd = () => {
    setEditing({
      name: '', nameAr: '', nameSo: '', description: '', descriptionAr: '', descriptionSo: '',
      icon: '', image: '', price: 0, currency: 'USD', formFields: [], active: true, order: services.length,
    });
    setShowModal(true);
  };

  const openEdit = (s: Service) => { setEditing({ ...s }); setShowModal(true); };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      db.update<any>('services', editing.id, editing);
    } else {
      db.add<Service>('services', editing);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this service?')) { db.delete('services', id); load(); }
  };

  const addFormField = () => {
    const field: FormField = {
      id: generateId(), label: '', labelAr: '', labelSo: '',
      type: 'text', options: [], required: false, order: (editing.formFields?.length || 0),
    };
    setEditing({ ...editing, formFields: [...(editing.formFields || []), field] });
  };

  const updateFormField = (idx: number, updates: Partial<FormField>) => {
    const fields = [...(editing.formFields || [])];
    fields[idx] = { ...fields[idx], ...updates };
    setEditing({ ...editing, formFields: fields });
  };

  const removeFormField = (idx: number) => {
    setEditing({ ...editing, formFields: editing.formFields.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Service</button>
      </div>

      {services.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">🏥</span>
          <p className="text-gray-500 mb-4">No services added yet</p>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add First Service</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                {s.icon && <span className="text-2xl">{s.icon}</span>}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{s.name || 'Unnamed'}</h3>
                  {s.price > 0 && <p className="text-sm text-primary-600">{s.currency} {s.price}</p>}
                  <span className={`badge mt-1 ${s.active ? 'badge-paid' : 'badge-rejected'}`}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{s.description}</p>
              {s.formFields?.length > 0 && (
                <p className="text-xs text-gray-400 mb-3">{s.formFields.length} custom field(s)</p>
              )}
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openEdit(s)} className="btn-secondary flex-1 text-xs py-1.5"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(s.id)} className="btn-danger flex-1 text-xs py-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
                  <input type="text" value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} className="input-field" placeholder="🩺" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input type="url" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (EN)</label>
                  <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (AR)</label>
                  <input type="text" dir="rtl" value={editing.nameAr || ''} onChange={e => setEditing({ ...editing, nameAr: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (SO)</label>
                  <input type="text" value={editing.nameSo || ''} onChange={e => setEditing({ ...editing, nameSo: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                <textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (AR)</label>
                <textarea rows={3} dir="rtl" value={editing.descriptionAr || ''} onChange={e => setEditing({ ...editing, descriptionAr: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (SO)</label>
                <textarea rows={3} value={editing.descriptionSo || ''} onChange={e => setEditing({ ...editing, descriptionSo: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input type="number" min="0" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })} className="input-field">
                    <option value="USD">USD</option>
                    <option value="SOS">SOS</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              {/* Custom Form Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Form Fields</label>
                  <button type="button" onClick={addFormField} className="btn-secondary text-xs py-1 px-2"><Plus className="w-3 h-3" /> Add Field</button>
                </div>
                <div className="space-y-3">
                  {editing.formFields?.map((field: FormField, idx: number) => (
                    <div key={field.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Field #{idx + 1}</span>
                        <button onClick={() => removeFormField(idx)} className="text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={field.label} onChange={e => updateFormField(idx, { label: e.target.value })} className="input-field text-xs" placeholder="Label (EN)" />
                        <select value={field.type} onChange={e => updateFormField(idx, { type: e.target.value as any })} className="input-field text-xs">
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="date">Date</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" dir="rtl" value={field.labelAr || ''} onChange={e => updateFormField(idx, { labelAr: e.target.value })} className="input-field text-xs" placeholder="Label (AR)" />
                        <input type="text" value={field.labelSo || ''} onChange={e => updateFormField(idx, { labelSo: e.target.value })} className="input-field text-xs" placeholder="Label (SO)" />
                      </div>
                      {field.type === 'select' && (
                        <input type="text" value={field.options?.join(', ') || ''} onChange={e => updateFormField(idx, { options: e.target.value.split(',').map(o => o.trim()) })} className="input-field text-xs" placeholder="Options (comma separated)" />
                      )}
                      <label className="flex items-center gap-1.5 text-xs">
                        <input type="checkbox" checked={field.required} onChange={e => updateFormField(idx, { required: e.target.checked })} className="rounded" />
                        Required
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                  <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
