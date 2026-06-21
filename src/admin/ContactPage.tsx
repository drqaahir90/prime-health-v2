import { useState } from 'react';
import { MessageSquare, Settings } from 'lucide-react';
import { ContactManager } from './ContentManagers';
import { ContactInfoManager } from './SettingsManagers';

export default function ContactPage() {
  const [tab, setTab] = useState<'messages' | 'settings'>('messages');

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'messages'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Messages
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'settings'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" /> Contact Settings
        </button>
      </div>

      {tab === 'messages' ? <ContactManager /> : <ContactInfoManager />}
    </div>
  );
}
