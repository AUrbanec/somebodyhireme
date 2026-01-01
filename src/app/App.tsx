import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronDown, ChevronUp, Calendar, Mail, Linkedin, Github } from 'lucide-react';
import { fetchSiteData, submitContactForm } from './api';
// Placeholder image - replace with actual image path
const dogImage = 'https://placehold.co/400x300/e9a737/white?text=Photo';

interface SiteData {
  settings: Record<string, string>;
  personalOverview: {
    about_me: string;
    video_url?: string;
    traits: string;
    image1_url?: string;
    image2_url?: string;
  };
  experience: Array<{
    id: number;
    title: string;
    period: string;
    company: string;
    details: string;
  }>;
  testimonials: Array<{
    id: number;
    video_url?: string;
    quote: string;
    author: string;
  }>;
  skills: Array<{
    id: number;
    category: string;
    items: Array<{ name: string; details: string }>;
  }>;
  hobbies: Array<{
    id: number;
    title: string;
    details: string;
  }>;
  contactInfo: {
    name: string;
    tagline: string;
    email?: string;
    linkedin_url?: string;
    github_url?: string;
    calendar_url?: string;
    spotify_embed_url?: string;
    google_calendar_embed_url?: string;
  };
}

const Collapsible: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ 
  title, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-[#efc172] rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center hover:bg-[#f5f3ef] transition-colors"
      >
        <span className="text-left">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-[#efc172] bg-[#f5f3ef]">
          {children}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    preferredDate: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSiteData()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      await submitContactForm(formData);
      setFormStatus('success');
      setFormData({ name: '', email: '', company: '', preferredDate: '', message: '' });
    } catch {
      setFormStatus('error');
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e9a737] via-[#eff5f5] to-[#f0eff5]">
        <div className="text-2xl text-[#107d8d]">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e9a737] via-[#eff5f5] to-[#f0eff5]">
        <div className="text-xl text-red-600">Failed to load site data. Please try again later.</div>
      </div>
    );
  }

  const { settings, personalOverview, experience, testimonials, skills, hobbies, contactInfo } = data;
  const heroBullets = settings.hero_bullets ? JSON.parse(settings.hero_bullets) : [];
  const traits = personalOverview?.traits ? JSON.parse(personalOverview.traits) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9a737] via-[#eff5f5] to-[#f0eff5]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-br from-[#523709] via-[#094952] to-[#120952]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-[#f6dbad] drop-shadow-lg">
            {settings.hero_title || 'SomebodyHire.Me'}
          </h1>
          
          <div className="space-y-6 text-[#f6dbad]">
            <p className="text-2xl md:text-4xl font-bold leading-relaxed">
              {settings.hero_tagline1}
            </p>
            
            <p className="text-2xl md:text-4xl font-bold leading-relaxed text-[#adedf6]">
              {settings.hero_tagline2}
            </p>
          </div>
          
          <div className="space-y-4 text-[#efc172] mt-12">
            <p className="text-xl md:text-2xl leading-relaxed">
              {settings.hero_description}
            </p>
            
            <p className="text-xl md:text-2xl leading-relaxed text-[#b6adf6]">
              {settings.hero_subdescription}
            </p>
            
            <ul className="text-lg md:text-xl text-left max-w-3xl mx-auto space-y-3 text-[#72dfef]">
              {heroBullets.map((bullet: string, idx: number) => (
                <li key={idx}>• {bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Personal Overview Section */}
      <section className="bg-[#eff5f5] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#107d8d]">Personal Overview</h2>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-[#107d8d]">About Me</h3>
                <p className="text-gray-700">{personalOverview?.about_me}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md aspect-video flex items-center justify-center text-gray-500">
                {personalOverview?.video_url ? (
                  <iframe src={personalOverview.video_url} className="w-full h-full rounded" allowFullScreen />
                ) : (
                  <p>[Video Introduction Placeholder - Add your video URL here]</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-[#107d8d]">Personal Traits</h3>
                <ul className="space-y-2 text-gray-700">
                  {traits.map((trait: string, idx: number) => (
                    <li key={idx}>{trait}</li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <img src={personalOverview?.image1_url || dogImage} alt="Personal" className="w-full h-48 object-cover rounded-lg shadow-md" />
                <img src={personalOverview?.image2_url || dogImage} alt="Personal" className="w-full h-48 object-cover rounded-lg shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#8d5e10]">Experience</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {experience.map((exp, index) => {
              const details = typeof exp.details === 'string' ? JSON.parse(exp.details) : exp.details;
              return (
                <Collapsible key={exp.id} title={`${exp.title} (${exp.period})`} defaultOpen={index === 0}>
                  <div className="space-y-3">
                    <p className="font-semibold text-[#8d5e10]">{exp.company}</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      {details.map((detail: string, idx: number) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#f0eff5] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#20108d]">Testimonials</h2>
          <div className="max-w-4xl mx-auto">
            <Slider {...sliderSettings}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="px-4">
                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                      {testimonial.video_url ? (
                        <iframe src={testimonial.video_url} className="w-full h-full rounded" allowFullScreen />
                      ) : (
                        <span>[Video Testimonial Placeholder]</span>
                      )}
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                    <p className="text-right mt-4 font-semibold text-[#20108d]">- {testimonial.author}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#107d8d]">Skills</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {skills.map((category) => (
              <Collapsible key={category.id} title={category.category}>
                <ul className="space-y-3">
                  {category.items.map((skill, idx) => (
                    <li key={idx} className="border-b border-[#adedf6] pb-2 last:border-b-0">
                      <p className="font-semibold text-[#107d8d]">{skill.name}</p>
                      <p className="text-gray-700 text-sm mt-1">{skill.details}</p>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Hobbies Section */}
      <section className="bg-[#f5f3ef] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#8d5e10]">Hobbies & Interests</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              {hobbies.map((hobby) => (
                <Collapsible key={hobby.id} title={hobby.title}>
                  <p className="text-gray-700">{hobby.details}</p>
                </Collapsible>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-[#8d5e10]">My Music Playlist</h3>
              <div className="aspect-[4/1] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                {contactInfo?.spotify_embed_url ? (
                  <iframe src={contactInfo.spotify_embed_url} className="w-full h-full rounded" allowFullScreen />
                ) : (
                  <p>[Spotify Playlist Embed - Add your Spotify iframe URL here]</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Scheduling Section */}
      <section className="py-16 bg-gradient-to-b from-[#eff5f5] to-[#f0eff5]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#20108d]">Schedule an Interview</h2>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-[#107d8d]">Contact Form</h3>
              {formStatus === 'success' ? (
                <div className="text-green-600 text-center py-8">
                  <p className="text-xl font-semibold">Thank you!</p>
                  <p>Your message has been sent successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#37d2e9] focus:border-transparent"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#37d2e9] focus:border-transparent"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#37d2e9] focus:border-transparent"
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#37d2e9] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Message</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#37d2e9] focus:border-transparent"
                      placeholder="Tell me about the opportunity..."
                    />
                  </div>
                  {formStatus === 'error' && (
                    <p className="text-red-600 text-sm">Failed to send. Please try again.</p>
                  )}
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full bg-[#37d2e9] hover:bg-[#16b1c8] text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {formStatus === 'sending' ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Calendar */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-[#107d8d]">My Availability</h3>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                {contactInfo?.google_calendar_embed_url ? (
                  <iframe src={contactInfo.google_calendar_embed_url} className="w-full h-full rounded" />
                ) : (
                  <p className="text-center px-4">[Google Calendar Embed - Add your calendar embed URL here]</p>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-600">Typically available:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Monday - Friday: 9 AM - 5 PM CST</li>
                  <li>• Flexible for different time zones</li>
                  <li>• Available for urgent interviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#170f03] text-[#f6dbad] py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold">{contactInfo?.name || 'Alex Urbanec'}</p>
              <p className="text-sm text-[#efc172]">{contactInfo?.tagline || 'AI Engineer | Data Architect | Problem Solver'}</p>
            </div>
            <div className="flex gap-4">
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`} className="hover:text-[#efc172] transition-colors" aria-label="Email">
                  <Mail size={24} />
                </a>
              )}
              {contactInfo?.linkedin_url && (
                <a href={contactInfo.linkedin_url} className="hover:text-[#efc172] transition-colors" aria-label="LinkedIn">
                  <Linkedin size={24} />
                </a>
              )}
              {contactInfo?.github_url && (
                <a href={contactInfo.github_url} className="hover:text-[#efc172] transition-colors" aria-label="GitHub">
                  <Github size={24} />
                </a>
              )}
              {contactInfo?.calendar_url && (
                <a href={contactInfo.calendar_url} className="hover:text-[#efc172] transition-colors" aria-label="Calendar">
                  <Calendar size={24} />
                </a>
              )}
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-[#efc172]">
            <p>{settings.copyright_text || '© 2024 SomebodyHire.Me | Built with personality and desperation'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}