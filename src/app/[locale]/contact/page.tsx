'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchSettings, SiteSettings } from '@/lib/api';
import OceanHeader from '@/components/OceanHeader';

export default function ContactPage() {
  const { locale, t } = useLocale();
  const isRTL = locale === 'ar';

  // Load dynamic settings from API
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Support multi-value contact info
  const rawEmails = settings?.contactEmails;
  const rawPhones = settings?.contactPhones;
  const rawWhatsAppNumbers = settings?.contactWhatsAppNumbers || (settings?.contactWhatsApp ? [settings.contactWhatsApp] : []);
  const displayEmails = (rawEmails && Array.isArray(rawEmails) && rawEmails.length > 0)
    ? rawEmails.filter(e => e && e.trim())
    : (settings?.contactEmail ? [settings.contactEmail] : ['sabrina@wstoolcabinet.com']);
  const displayPhones = (rawPhones && Array.isArray(rawPhones) && rawPhones.length > 0)
    ? rawPhones.filter(p => p && p.trim())
    : (settings?.contactPhone ? [settings.contactPhone] : ['+86 156 2216 0659']);
  const displayWhatsAppNumbers = (rawWhatsAppNumbers && Array.isArray(rawWhatsAppNumbers) && rawWhatsAppNumbers.length > 0)
    ? rawWhatsAppNumbers.filter(w => w && w.trim())
    : [];
  const displayEmail = displayEmails[0];
  const displayPhone = displayPhones[0];
  const displayWeChat = settings?.socialWechat || 'QiuyuanTech';
  const displayAddress = settings ? (locale === 'zh' ? (settings.addressZh || '') : locale === 'ar' ? (settings.addressAr || '') : (settings.address || '')) : '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 6000);
  };

  const contactInfoItems = [
    {
      icon: Phone,
      label: t('contact.phone'),
      lines: [
        ...displayPhones,
        locale === 'zh' ? '周一至周六 8:00-18:00（北京时间）' : locale === 'ar' ? 'الإثنين-السبت، 8:00-18:00 (توقيت بكين)' : 'Mon-Sat, 8:00-18:00 (Beijing Time)',
      ],
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      icon: Mail,
      label: t('contact.email'),
      lines: [
        ...displayEmails,
        locale === 'zh' ? '24小时内回复' : locale === 'ar' ? 'رد خلال 24 ساعة' : 'Response within 24 hours',
      ],
      color: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    {
      icon: MessageCircle,
      label: locale === 'zh' ? '微信' : locale === 'ar' ? 'ويتشات' : 'WeChat',
      lines: [
        locale === 'zh' ? `微信: ${displayWeChat}` : `WeChat: ${displayWeChat}`,
        locale === 'zh' ? '扫码添加客服微信' : locale === 'ar' ? 'امسح الرمز لإضافة خدمة العملاء' : 'Scan QR code to add customer service',
      ],
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    // WhatsApp entry (only show if WhatsApp numbers are configured)
    ...(displayWhatsAppNumbers.length > 0 ? [{
      icon: Phone,
      label: locale === 'zh' ? 'WhatsApp' : locale === 'ar' ? 'واتساب' : 'WhatsApp',
      lines: [
        ...displayWhatsAppNumbers,
        locale === 'zh' ? '可通过WhatsApp联系我们' : locale === 'ar' ? 'يمكنك التواصل عبر واتساب' : 'Contact us via WhatsApp',
      ],
      color: 'bg-green-50 text-green-600 border-green-100',
    }] : []),
    {
      icon: MapPin,
      label: t('contact.address'),
      lines: displayAddress ? [
        displayAddress,
        locale === 'zh' ? '广东省广州市' : locale === 'ar' ? 'غوانغتشو، غوانغدونغ' : 'Guangzhou, Guangdong Province, China',
      ] : [
        locale === 'zh' ? '广州市番禺区大龙街沙涌村长沙路沙接近' : locale === 'ar' ? 'Panyu District, Dalong Street, Shacong Village, Changsha Road' : 'Panyu District, Dalong Street, Shacong Village, Changsha Road',
        locale === 'zh' ? '广东省广州市，邮编 511400' : locale === 'ar' ? 'غوانغتشو، مقاطعة غوانغدونغ، الصين - الرمز البريدي: 511400' : 'Guangzhou, Guangdong Province, China - Zip: 511400',
      ],
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: Clock,
      label: t('contact.workingHours'),
      lines: [
        locale === 'zh' ? '周一至周五: 9:00 - 18:00' : locale === 'ar' ? 'الإثنين - الجمعة: 9:00 - 18:00' : 'Monday - Friday: 9:00 AM - 6:00 PM',
        locale === 'zh' ? '周六: 10:00 - 14:00' : locale === 'ar' ? 'السبت: 10:00 - 14:00' : 'Saturday: 10:00 AM - 2:00 PM',
        locale === 'zh' ? '周日: 休息' : locale === 'ar' ? 'الأحد: مغلق' : 'Sunday: Closed',
      ],
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tc-bg, #f9fafb)' }}>
      {/* Page Header — Ocean Theme */}
      <OceanHeader
        title={t('contact.heroTitle')}
        subtitle={t('contact.heroSubtitle')}
        icon={<MessageCircle className="w-8 h-8 text-blue-300" />}
      />

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Column - Contact Info */}
          <div className={`lg:col-span-2 ${isRTL ? 'order-2' : ''}`}>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 rounded-full inline-block" style={{ backgroundColor: 'var(--primary-color, #2563eb)' }} />
              {t('contact.getInTouch')}
            </h2>

            <div className="space-y-5">
              {contactInfoItems.map((item, idx) => (
                <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${item.color}`} style={{ backgroundColor: 'var(--card-bg, #ffffff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color.split(' ')[0]}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1 text-sm">{item.label}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className={`${i === 0 ? 'text-[var(--text-primary)] font-semibold text-sm' : 'text-[var(--text-secondary)] font-normal text-xs mt-0.5'}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick info cards */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 text-center">
                <p className="text-2xl font-bold text-blue-600">60+</p>
                <p className="text-xs text-gray-500 mt-1">{locale === 'zh' ? '服务国家' : locale === 'ar' ? 'دولة' : 'Countries'}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100 text-center">
                <p className="text-2xl font-bold text-green-600">24h</p>
                <p className="text-xs text-gray-500 mt-1">{locale === 'zh' ? '响应时间' : locale === 'ar' ? 'وقت الاستجابة' : 'Response Time'}</p>
              </div>
            </div>

            {/* Map - Use iframe embedding OSM (most reliable method) */}
            <div className="mt-6 rounded-2xl overflow-hidden border relative" style={{ borderColor: 'var(--border-color, #e5e7eb)', backgroundColor: 'var(--section-alt-bg, #f0f4ff)' }}>
              {/* Interactive OSM Map via iframe - most reliable method */}
              <div className="relative w-full" style={{ height: '300px' }}>
                <iframe
                  title={locale === 'zh' ? '公司位置' : locale === 'ar' ? 'موقع الشركة' : 'Company Location'}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=113.45%2C23.15%2C113.55%2C23.25&layer=mapnik&marker=23.20%2C113.50"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to static image if iframe fails
                    const target = e.target as HTMLIFrameElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.map-fallback');
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
                <div className="map-fallback absolute inset-0 flex-col items-center justify-center hidden"
                  style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #fce7f3 100%)' }}
                >
                  <MapPin className="w-12 h-12 text-red-500 mb-3 animate-bounce" />
                  <p className="text-sm font-semibold text-gray-700">{displayAddress || 'Panyu District, Guangzhou, China'}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 23.20°N, 113.50°E</p>
                  <a href="https://www.openstreetmap.org/?mlat=23.20&mlon=113.50#map=13/23.20/113.50"
                    target="_blank" rel="noopener noreferrer"
                    className="mt-3 px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:shadow-lg hover:-translate-y-0.5 transform transition-transform"
                  >
                    {locale === 'zh' ? '在 OpenStreetMap 中查看' : locale === 'ar' ? 'عرض في الخريطة المفتوحة' : 'View on OpenStreetMap'}
                  </a>
                </div>
              </div>
              {/* Fallback address card */}
              <div className="backdrop-blur-sm p-4 border-t" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'var(--border-color, #e5e7eb)' }}>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{displayAddress || (locale === 'zh' ? '中国广东省广州市番禺区' : 'Panyu District, Guangzhou, China')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className={`lg:col-span-3 ${isRTL ? 'order-1' : ''}`}>
            <div className="contact-card rounded-2xl shadow-md p-8 border" style={{ backgroundColor: 'var(--card-bg, #ffffff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('contact.sendMessage')}</h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-semibold">
                      {locale === 'zh' ? '发送成功！我们会尽快回复您。' : locale === 'ar' ? 'تم الإرسال بنجاح! سنتواصل معك قريبًا.' : 'Message Sent! We will get back to you soon.'}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      {locale === 'zh' ? '感谢您的来信，通常在24小时内回复。' : locale === 'ar' ? 'شكراً لتواصلك، عادة ما نرد خلال 24 ساعة.' : 'Thanks for reaching out. We typically respond within 24 hours.'}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
                      placeholder={locale === 'zh' ? '您的姓名' : locale === 'ar' ? 'أدخل اسمك' : 'John Doe'}
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
                      placeholder={locale === 'zh' ? '电子邮箱' : locale === 'ar' ? 'البريد الإلكتروني' : 'john@example.com'}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-blue-300"
                    placeholder="+86 156 2216 0659"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact.subject')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{t('contact.selectSubject')}</option>
                    <option value="general">{t('contact.subject.general')}</option>
                    <option value="sales">{t('contact.subject.sales')}</option>
                    <option value="support">{t('contact.subject.support')}</option>
                    <option value="customization">{t('contact.subject.customization')}</option>
                    <option value="partnership">{t('contact.subject.partnership')}</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact.message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none hover:border-blue-300"
                    placeholder={locale === 'zh' ? '请描述您的项目需求、产品咨询或其他问题...' : locale === 'ar' ? 'صف مشروعك أو استفسارك...' : 'Tell us about your project or inquiry...'}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  style={{ backgroundColor: 'var(--primary-color, #2563eb)' }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'var(--primary-hover, #1d4ed8)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'var(--primary-color, #2563eb)'; }}
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span>{t('contact.form.submit')}</span>
                </button>
              </form>

              {/* Trust note */}
              <div className="mt-6 flex items-center gap-2 text-xs justify-center" style={{ color: 'var(--text-muted, #9ca3af)' }}>
                <CheckCircle className="w-4 h-4" />
                <span>{locale === 'zh' ? '您的信息安全，我们不会向第三方分享任何信息' : locale === 'ar' ? 'معلوماتك آمنة، لا نشارك أي معلومات مع أطراف ثالثة' : 'Your information is secure and never shared with third parties'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
