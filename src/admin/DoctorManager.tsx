import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { db } from '../lib/db';
import type { Doctor, Service } from '../types';

const emptyDoctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', nameAr: '', nameSo: '', photo: '',
  qualification: '', qualificationAr: '', qualificationSo: '',
  position: '', positionAr: '', positionSo: '',
  biography: '', biographyAr: '', biographySo: '',
  certificates: [], serviceIds: [], socialLinks: [],
  order: 0, active: true,
};

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newCert, setNewCert] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const load = () => {
    setDoctors(db.query<Doctor>('doctors', {}, { field: 'order', direction: 'asc' }));
    setServices(db.getAll<Service>('services'));
  };

  useEffect(() => {
    load();
    const unsubDocs = db.subscribe('doctors', load);
    const unsubServices = db.subscribe('services', load);
    return () => {
      unsubDocs();
      unsubServices();
    };
  }, []);

  const openAdd = () => {
    setEditing({ ...emptyDoctor, order: doctors.length });
    setShowModal(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditing({ ...doctor });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      db.update<any>('doctors', editing.id, editing);
    } else {
      db.add<Doctor>('doctors', editing);
    }
    setShowModal(false);
    setEditing(null);
    load();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this doctor?')) {
      db.delete('doctors', id);
      load();
    }
  };

  const addCertificate = () => {
    if (!newCert.trim()) return;
    setEditing({ ...editing, certificates: [...(editing.certificates || []), newCert.trim()] });
    setNewCert('');
  };

  const removeCertificate = (idx: number) => {
    setEditing({ ...editing, certificates: editing.certificates.filter((_: any, i: number) => i !== idx) });
  };

  const addSocialLink = () => {
    if (!newSocialPlatform || !newSocialUrl) return;
    setEditing({
      ...editing,
      socialLinks: [...(editing.socialLinks || []), { platform: newSocialPlatform, url: newSocialUrl }]
    });
    setNewSocialPlatform('');
    setNewSocialUrl('');
  };

  const removeSocialLink = (idx: number) => {
    setEditing({ ...editing, socialLinks: editing.socialLinks.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Manager</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Doctor</button>
      </div>

      {doctors.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">👨‍⚕️</span>
          <p className="text-gray-500 mb-4">No doctors added yet</p>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add First Doctor</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doctor => (
            <div key={doctor.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                  {doctor.photo ? (
                    <img src={doctor.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{doctor.name || 'Unnamed'}</h3>
                  <p className="text-sm text-primary-600 truncate">{doctor.position}</p>
                  <p className="text-xs text-gray-500 truncate">{doctor.qualification}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${doctor.active ? 'badge-paid' : 'badge-rejected'}`}>
                      {doctor.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openEdit(doctor)} className="btn-secondary flex-1 text-xs py-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(doctor.id)} className="btn-danger flex-1 text-xs py-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing.id ? 'Edit Doctor' : 'Add Doctor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Photo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo URL</label>
                <input type="url" value={editing.photo} onChange={e => setEditing({ ...editing, photo: e.target.value })} className="input-field" placeholder="https://..." />
                {editing.photo && <img src={editing.photo} alt="" className="w-20 h-20 rounded-lg object-cover mt-2" />}
              </div>

              {/* Names */}
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

              {/* Position */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position (EN)</label>
                  <input type="text" value={editing.position} onChange={e => setEditing({ ...editing, position: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position (AR)</label>
                  <input type="text" dir="rtl" value={editing.positionAr || ''} onChange={e => setEditing({ ...editing, positionAr: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position (SO)</label>
                  <input type="text" value={editing.positionSo || ''} onChange={e => setEditing({ ...editing, positionSo: e.target.value })} className="input-field" />
                </div>
              </div>

              {/* Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification (EN)</label>
                  <input type="text" value={editing.qualification} onChange={e => setEditing({ ...editing, qualification: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification (AR)</label>
                  <input type="text" dir="rtl" value={editing.qualificationAr || ''} onChange={e => setEditing({ ...editing, qualificationAr: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification (SO)</label>
                  <input type="text" value={editing.qualificationSo || ''} onChange={e => setEditing({ ...editing, qualificationSo: e.target.value })} className="input-field" />
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biography (EN)</label>
                <textarea rows={3} value={editing.biography} onChange={e => setEditing({ ...editing, biography: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biography (AR)</label>
                <textarea rows={3} dir="rtl" value={editing.biographyAr || ''} onChange={e => setEditing({ ...editing, biographyAr: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biography (SO)</label>
                <textarea rows={3} value={editing.biographySo || ''} onChange={e => setEditing({ ...editing, biographySo: e.target.value })} className="input-field" />
              </div>

              {/* Certificates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificates</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newCert} onChange={e => setNewCert(e.target.value)} className="input-field flex-1" placeholder="Certificate name" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCertificate())} />
                  <button type="button" onClick={addCertificate} className="btn-secondary"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                  {editing.certificates?.map((cert: string, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded text-sm">
                      <span>{cert}</span>
                      <button onClick={() => removeCertificate(i)} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services</label>
                <div className="flex flex-wrap gap-2">
                  {services.map(s => (
                    <label key={s.id} className="flex items-center gap-1.5 text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.serviceIds?.includes(s.id)}
                        onChange={e => {
                          const ids = editing.serviceIds || [];
                          setEditing({ ...editing, serviceIds: e.target.checked ? [...ids, s.id] : ids.filter((id: string) => id !== s.id) });
                        }}
                        className="rounded text-primary-600"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Social Links</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSocialPlatform} onChange={e => setNewSocialPlatform(e.target.value)} className="input-field" placeholder="Platform" />
                  <input type="url" value={newSocialUrl} onChange={e => setNewSocialUrl(e.target.value)} className="input-field flex-1" placeholder="URL" />
                  <button type="button" onClick={addSocialLink} className="btn-secondary"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                  {editing.socialLinks?.map((sl: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded text-sm">
                      <span>{sl.platform}: {sl.url}</span>
                      <button onClick={() => removeSocialLink(i)} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                  <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
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
