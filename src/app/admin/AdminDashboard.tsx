import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, Users, Briefcase, Star, BookOpen, Heart, Mail, Settings, LogOut, 
  Plus, Trash2, Save, ChevronDown, ChevronUp, Menu, X, Inbox
} from 'lucide-react';
import { removeToken } from '../api';
import * as api from '../api';

type TabType = 'hero' | 'personal' | 'experience' | 'testimonials' | 'skills' | 'hobbies' | 'contact' | 'submissions' | 'settings';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const tabs = [
    { id: 'hero' as TabType, label: 'Hero Section', icon: Home },
    { id: 'personal' as TabType, label: 'Personal Overview', icon: Users },
    { id: 'experience' as TabType, label: 'Experience', icon: Briefcase },
    { id: 'testimonials' as TabType, label: 'Testimonials', icon: Star },
    { id: 'skills' as TabType, label: 'Skills', icon: BookOpen },
    { id: 'hobbies' as TabType, label: 'Hobbies', icon: Heart },
    { id: 'contact' as TabType, label: 'Contact Info', icon: Mail },
    { id: 'submissions' as TabType, label: 'Inbox', icon: Inbox },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#170f03] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-[#523709]">
          {sidebarOpen && <h1 className="text-lg font-bold text-[#f6dbad]">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[#523709] rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                activeTab === tab.id ? 'bg-[#107d8d] text-white' : 'hover:bg-[#523709] text-[#efc172]'
              }`}
            >
              <tab.icon size={20} />
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-[#523709]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          {message && (
            <div className={`px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'hero' && <HeroEditor showMessage={showMessage} />}
          {activeTab === 'personal' && <PersonalEditor showMessage={showMessage} />}
          {activeTab === 'experience' && <ExperienceEditor showMessage={showMessage} />}
          {activeTab === 'testimonials' && <TestimonialsEditor showMessage={showMessage} />}
          {activeTab === 'skills' && <SkillsEditor showMessage={showMessage} />}
          {activeTab === 'hobbies' && <HobbiesEditor showMessage={showMessage} />}
          {activeTab === 'contact' && <ContactEditor showMessage={showMessage} />}
          {activeTab === 'submissions' && <SubmissionsViewer showMessage={showMessage} />}
          {activeTab === 'settings' && <SettingsPanel showMessage={showMessage} />}
        </div>
      </main>
    </div>
  );
};

// Shared props type
interface EditorProps {
  showMessage: (type: 'success' | 'error', text: string) => void;
}

// Hero Section Editor
const HeroEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.fetchSettings().then(setSettings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      showMessage('success', 'Hero section saved!');
    } catch (err) {
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const bullets = settings.hero_bullets ? JSON.parse(settings.hero_bullets) : [];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
        <input
          type="text"
          value={settings.hero_title || ''}
          onChange={(e) => updateSetting('hero_title', e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Main Tagline</label>
        <textarea
          value={settings.hero_tagline1 || ''}
          onChange={(e) => updateSetting('hero_tagline1', e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d] min-h-[80px] resize-y"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Tagline</label>
        <input
          type="text"
          value={settings.hero_tagline2 || ''}
          onChange={(e) => updateSetting('hero_tagline2', e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={settings.hero_description || ''}
          onChange={(e) => updateSetting('hero_description', e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d] min-h-[100px] resize-y"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sub-description</label>
        <textarea
          value={settings.hero_subdescription || ''}
          onChange={(e) => updateSetting('hero_subdescription', e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d] min-h-[60px] resize-y"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bullet Points (one per line)</label>
        <textarea
          value={bullets.join('\n')}
          onChange={(e) => updateSetting('hero_bullets', JSON.stringify(e.target.value.split('\n')))}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d] min-h-[120px] resize-y"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
        <input
          type="text"
          value={settings.copyright_text || ''}
          onChange={(e) => updateSetting('copyright_text', e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[#107d8d] hover:bg-[#0a5a66] text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

// Personal Overview Editor
const PersonalEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.fetchPersonalOverview().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updatePersonalOverview(data);
      showMessage('success', 'Personal overview saved!');
    } catch (err) {
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const traits = data.traits ? (typeof data.traits === 'string' ? JSON.parse(data.traits) : data.traits) : [];

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
        <textarea
          value={data.about_me || ''}
          onChange={(e) => setData({ ...data, about_me: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d] min-h-[100px] resize-y"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
        <input
          type="text"
          value={data.video_url || ''}
          onChange={(e) => setData({ ...data, video_url: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d]"
          placeholder="https://youtube.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Personal Traits (one per line with emoji)</label>
        <textarea
          value={traits.join('\n')}
          onChange={(e) => setData({ ...data, traits: JSON.stringify(e.target.value.split('\n')) })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d] min-h-[150px] resize-y"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
          placeholder="✨ Creative problem solver"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image 1 URL</label>
          <input
            type="text"
            value={data.image1_url || ''}
            onChange={(e) => setData({ ...data, image1_url: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image 2 URL</label>
          <input
            type="text"
            value={data.image2_url || ''}
            onChange={(e) => setData({ ...data, image2_url: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#107d8d]"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[#107d8d] hover:bg-[#0a5a66] text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

// Experience Editor
const ExperienceEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.fetchExperience().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const handleSave = async (item: any) => {
    try {
      if (item.id) {
        await api.updateExperience(item.id, item);
      } else {
        await api.createExperience(item);
      }
      showMessage('success', 'Experience saved!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this experience?')) return;
    try {
      await api.deleteExperience(id);
      showMessage('success', 'Experience deleted!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  const addNew = () => {
    setItems([...items, { title: '', period: '', company: '', details: '[]', sort_order: items.length, isNew: true }]);
    setExpanded(items.length);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <ExperienceItem
          key={item.id || `new-${idx}`}
          item={item}
          expanded={expanded === idx}
          onToggle={() => setExpanded(expanded === idx ? null : idx)}
          onSave={handleSave}
          onDelete={() => handleDelete(item.id)}
          onChange={(updated) => {
            const newItems = [...items];
            newItems[idx] = updated;
            setItems(newItems);
          }}
        />
      ))}
      <button
        onClick={addNew}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        <Plus size={20} />
        Add Experience
      </button>
    </div>
  );
};

const ExperienceItem: React.FC<{
  item: any;
  expanded: boolean;
  onToggle: () => void;
  onSave: (item: any) => void;
  onDelete: () => void;
  onChange: (item: any) => void;
}> = ({ item, expanded, onToggle, onSave, onDelete, onChange }) => {
  const details = typeof item.details === 'string' ? JSON.parse(item.details || '[]') : item.details;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div>
          <h3 className="font-medium">{item.title || 'New Experience'}</h3>
          <p className="text-sm text-gray-500">{item.period} - {item.company}</p>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 border-t space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => onChange({ ...item, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                type="text"
                value={item.company}
                onChange={(e) => onChange({ ...item, company: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <input
              type="text"
              value={item.period}
              onChange={(e) => onChange({ ...item, period: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="August 2024 – Present"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details (one per line)</label>
            <textarea
              value={details.join('\n')}
              onChange={(e) => onChange({ ...item, details: JSON.stringify(e.target.value.split('\n')) })}
              className="w-full p-2 border rounded min-h-[120px] resize-y"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSave(item)} className="flex items-center gap-1 bg-[#107d8d] text-white px-4 py-2 rounded">
              <Save size={16} /> Save
            </button>
            {item.id && (
              <button onClick={onDelete} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded">
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Testimonials Editor
const TestimonialsEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.fetchTestimonials().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const handleSave = async (item: any) => {
    try {
      if (item.id) {
        await api.updateTestimonial(item.id, item);
      } else {
        await api.createTestimonial(item);
      }
      showMessage('success', 'Testimonial saved!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await api.deleteTestimonial(id);
      showMessage('success', 'Testimonial deleted!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  const addNew = () => {
    setItems([...items, { quote: '', author: '', video_url: '', sort_order: items.length }]);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="bg-white rounded-lg shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quote</label>
            <textarea
              value={item.quote}
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx] = { ...item, quote: e.target.value };
                setItems(newItems);
              }}
              className="w-full p-2 border rounded min-h-[80px] resize-y"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                value={item.author}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...item, author: e.target.value };
                  setItems(newItems);
                }}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Video URL (optional)</label>
              <input
                type="text"
                value={item.video_url || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...item, video_url: e.target.value };
                  setItems(newItems);
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSave(item)} className="flex items-center gap-1 bg-[#107d8d] text-white px-4 py-2 rounded">
              <Save size={16} /> Save
            </button>
            {item.id && (
              <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded">
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      ))}
      <button onClick={addNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
        <Plus size={20} /> Add Testimonial
      </button>
    </div>
  );
};

// Skills Editor
const SkillsEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.fetchSkills().then(setCategories).catch(console.error).finally(() => setLoading(false));
  };

  const handleSave = async (cat: any) => {
    try {
      if (cat.id) {
        await api.updateSkill(cat.id, cat);
      } else {
        await api.createSkill(cat);
      }
      showMessage('success', 'Skill category saved!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill category?')) return;
    try {
      await api.deleteSkill(id);
      showMessage('success', 'Skill category deleted!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  const addNew = () => {
    setCategories([...categories, { category: '', items: [], sort_order: categories.length }]);
    setExpanded(categories.length);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {categories.map((cat, idx) => (
        <div key={cat.id || idx} className="bg-white rounded-lg shadow">
          <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === idx ? null : idx)}>
            <h3 className="font-medium">{cat.category || 'New Category'}</h3>
            {expanded === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expanded === idx && (
            <div className="p-4 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  value={cat.category}
                  onChange={(e) => {
                    const newCats = [...categories];
                    newCats[idx] = { ...cat, category: e.target.value };
                    setCategories(newCats);
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Skills</label>
                {(cat.items || []).map((item: any, itemIdx: number) => (
                  <div key={itemIdx} className="mb-3 p-3 bg-gray-50 rounded">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...cat.items];
                        newItems[itemIdx] = { ...item, name: e.target.value };
                        const newCats = [...categories];
                        newCats[idx] = { ...cat, items: newItems };
                        setCategories(newCats);
                      }}
                      placeholder="Skill name"
                      className="w-full p-2 border rounded mb-2"
                    />
                    <input
                      type="text"
                      value={item.details}
                      onChange={(e) => {
                        const newItems = [...cat.items];
                        newItems[itemIdx] = { ...item, details: e.target.value };
                        const newCats = [...categories];
                        newCats[idx] = { ...cat, items: newItems };
                        setCategories(newCats);
                      }}
                      placeholder="Details"
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => {
                        const newItems = cat.items.filter((_: any, i: number) => i !== itemIdx);
                        const newCats = [...categories];
                        newCats[idx] = { ...cat, items: newItems };
                        setCategories(newCats);
                      }}
                      className="mt-2 text-red-600 text-sm"
                    >
                      Remove skill
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItems = [...(cat.items || []), { name: '', details: '', sort_order: cat.items?.length || 0 }];
                    const newCats = [...categories];
                    newCats[idx] = { ...cat, items: newItems };
                    setCategories(newCats);
                  }}
                  className="text-[#107d8d] text-sm"
                >
                  + Add skill
                </button>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => handleSave(cat)} className="flex items-center gap-1 bg-[#107d8d] text-white px-4 py-2 rounded">
                  <Save size={16} /> Save
                </button>
                {cat.id && (
                  <button onClick={() => handleDelete(cat.id)} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded">
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={addNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
        <Plus size={20} /> Add Skill Category
      </button>
    </div>
  );
};

// Hobbies Editor
const HobbiesEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.fetchHobbies().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const handleSave = async (item: any) => {
    try {
      if (item.id) {
        await api.updateHobby(item.id, item);
      } else {
        await api.createHobby(item);
      }
      showMessage('success', 'Hobby saved!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this hobby?')) return;
    try {
      await api.deleteHobby(id);
      showMessage('success', 'Hobby deleted!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  const addNew = () => {
    setItems([...items, { title: '', details: '', sort_order: items.length }]);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="bg-white rounded-lg shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx] = { ...item, title: e.target.value };
                setItems(newItems);
              }}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details</label>
            <textarea
              value={item.details}
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx] = { ...item, details: e.target.value };
                setItems(newItems);
              }}
              className="w-full p-2 border rounded min-h-[80px] resize-y"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSave(item)} className="flex items-center gap-1 bg-[#107d8d] text-white px-4 py-2 rounded">
              <Save size={16} /> Save
            </button>
            {item.id && (
              <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded">
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      ))}
      <button onClick={addNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
        <Plus size={20} /> Add Hobby
      </button>
    </div>
  );
};

// Contact Info Editor
const ContactEditor: React.FC<EditorProps> = ({ showMessage }) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.fetchContactInfo().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateContactInfo(data);
      showMessage('success', 'Contact info saved!');
    } catch (err) {
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tagline</label>
          <input
            type="text"
            value={data.tagline || ''}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={data.email || ''}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
          <input
            type="text"
            value={data.linkedin_url || ''}
            onChange={(e) => setData({ ...data, linkedin_url: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input
            type="text"
            value={data.github_url || ''}
            onChange={(e) => setData({ ...data, github_url: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Calendar URL</label>
        <input
          type="text"
          value={data.calendar_url || ''}
          onChange={(e) => setData({ ...data, calendar_url: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Spotify Embed URL</label>
        <input
          type="text"
          value={data.spotify_embed_url || ''}
          onChange={(e) => setData({ ...data, spotify_embed_url: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://open.spotify.com/embed/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Google Calendar Embed URL</label>
        <input
          type="text"
          value={data.google_calendar_embed_url || ''}
          onChange={(e) => setData({ ...data, google_calendar_embed_url: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[#107d8d] hover:bg-[#0a5a66] text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

// Submissions Viewer
const SubmissionsViewer: React.FC<EditorProps> = ({ showMessage }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.fetchSubmissions().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.markSubmissionRead(id);
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to mark as read');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this submission?')) return;
    try {
      await api.deleteSubmission(id);
      showMessage('success', 'Submission deleted!');
      loadData();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No submissions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className={`bg-white rounded-lg shadow p-4 ${!item.read ? 'border-l-4 border-[#107d8d]' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.email}</p>
            </div>
            <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
          </div>
          {item.company && <p className="text-sm"><strong>Company:</strong> {item.company}</p>}
          {item.preferred_date && <p className="text-sm"><strong>Preferred Date:</strong> {item.preferred_date}</p>}
          {item.message && <p className="mt-2 text-gray-700">{item.message}</p>}
          <div className="mt-4 flex gap-2">
            {!item.read && (
              <button onClick={() => handleMarkRead(item.id)} className="text-sm text-[#107d8d]">
                Mark as read
              </button>
            )}
            <button onClick={() => handleDelete(item.id)} className="text-sm text-red-600">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Settings Panel
const SettingsPanel: React.FC<EditorProps> = ({ showMessage }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);

  const pageVisibilityOptions = [
    { key: 'page_personal_enabled', label: 'Personal Overview' },
    { key: 'page_experience_enabled', label: 'Experience' },
    { key: 'page_testimonials_enabled', label: 'Testimonials' },
    { key: 'page_skills_enabled', label: 'Skills' },
    { key: 'page_hobbies_enabled', label: 'Hobbies & Interests' },
    { key: 'page_contact_enabled', label: 'Schedule an Interview' },
  ];

  useEffect(() => {
    api.fetchSettings().then(setSettings).catch(console.error).finally(() => setLoadingSettings(false));
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      showMessage('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const togglePageVisibility = (key: string) => {
    const currentValue = settings[key] !== 'false';
    setSettings(prev => ({ ...prev, [key]: (!currentValue).toString() }));
  };

  const handleSaveVisibility = async () => {
    setSavingVisibility(true);
    try {
      await api.updateSettings(settings);
      showMessage('success', 'Page visibility saved!');
    } catch (err) {
      showMessage('error', 'Failed to save visibility settings');
    } finally {
      setSavingVisibility(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Visibility Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Page Visibility</h3>
        <p className="text-sm text-gray-500 mb-4">Toggle sections on or off on your public site.</p>
        {loadingSettings ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-3">
            {pageVisibilityOptions.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <span className="text-gray-700">{label}</span>
                <button
                  onClick={() => togglePageVisibility(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[key] !== 'false' ? 'bg-[#107d8d]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[key] !== 'false' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            <button
              onClick={handleSaveVisibility}
              disabled={savingVisibility}
              className="mt-4 flex items-center gap-2 bg-[#107d8d] hover:bg-[#0a5a66] text-white px-4 py-2 rounded disabled:opacity-50"
            >
              <Save size={16} />
              {savingVisibility ? 'Saving...' : 'Save Visibility Settings'}
            </button>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="bg-[#107d8d] hover:bg-[#0a5a66] text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};
