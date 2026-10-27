import { Sparkles, Heart, MapPin, Phone, Clock, Award, Users, CheckCircle2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { usePageMeta } from '../hooks/usePageMeta';
import ImageWithFallback from '../components/common/ImageWithFallback';

export default function About() {
  const { companyDetails } = useCompany();

  usePageMeta(
    `About Us | ${companyDetails.shopName}`,
    `Learn about ${companyDetails.shopName} established in ${companyDetails.establishedYear || '2016'}. Specialized in bridal bangles, imitation temple jewelry, cosmetics, and festive gifts in ${companyDetails.address?.city || 'Erode'}.`
  );

  const departments = [
    { icon: Sparkles, color: 'primary', title: 'Bridal Bangle Studio', desc: 'Velvet chudas, silk-thread custom sets, glass bangles in 50+ colors, and Kundan stone designer sets.' },
    { icon: Award,    color: 'gold',    title: 'Temple & Antique Jewelry', desc: 'Kasu harams, bridal chokers, Kemp stone vankis, hip chains (oddiyanam), and statement jhumkas.' },
    { icon: Heart,    color: 'pink',    title: 'Cosmetics & Salon Care', desc: 'Top brands of matte lipsticks, foundations, organic kajals, nail lacquers, and mehendi cones.' },
    { icon: Users,    color: 'purple',  title: 'Gifts & Clutches Studio', desc: 'Embroidered potlis, party clutches, return gift sets, toys, attars, and custom celebration hampers.' },
  ];

  const iconBg = {
    primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    gold:    'bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)]',
    pink:    'bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
    purple:  'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="min-h-screen py-12 bg-[var(--color-bg-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-gold)]" />
              Established in {companyDetails.establishedYear}
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-main)] leading-tight">
              About {companyDetails.shopName}
            </h1>
            <p className="font-serif italic text-[var(--color-primary)] text-lg">
              {companyDetails.shopNameTamil} — Tradition, Beauty &amp; Festive Elegance.
            </p>

            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              Founded with a passion to bring traditional South Indian festive adornments and modern beauty essentials under one roof,{' '}
              <strong className="text-[var(--color-text-main)]">{companyDetails.shopName}</strong> has become the neighborhood's beloved destination for bridal bangles, matte gold imitation jewelry, trending cosmetics, and thoughtful gifts.
            </p>

            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              We understand that every celebration — whether a wedding muhurtham, baby shower, temple festival, or birthday — is crowned by the right jewelry and accessories. Our experienced staff assists families with custom bangle matching, saree coordination, and bridal vanity preparations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {['Specialized Bridal Bangle Customization', 'Exquisite 1-Gram Matte Gold Finish', 'Original Brand Cosmetics & Skincare', 'Personalized In-Store Color Matching'].map((pt, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-main)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-emerald)] shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1611591475852-5a4ceaa09e53?auto=format&fit=crop&w=800&q=80"
                alt="Store ambiance and bridal collection"
                aspectRatioClass="aspect-[3/4]"
                className="w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                <div className="flex items-center gap-3">
                  <img src={companyDetails.logo} alt="" className="w-10 h-10 object-contain bg-white/20 p-1 rounded-xl" />
                  <div>
                    <h3 className="font-serif text-lg font-bold m-0">{companyDetails.shopName}</h3>
                    <p className="text-xs text-rose-200 m-0">{companyDetails.tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Inside Our Showroom</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] mt-1">Curated Departments For Every Need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {departments.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--color-card-shadow)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg[color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-[var(--color-text-main)] m-0">{title}</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed m-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        <div className="p-8 rounded-3xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: 'Physical Storefront', text: `${companyDetails.address.street}, ${companyDetails.address.landmark}, ${companyDetails.address.city} - ${companyDetails.address.pincode}` },
              { icon: Clock,  label: 'Store Hours',         text: companyDetails.businessHours.map((h) => `${h.days}: ${h.hours}`).join('\n') },
              { icon: Phone,  label: 'Customer Assistance', text: `Phone: ${companyDetails.contact.primaryPhone}\nWhatsApp: ${companyDetails.contact.whatsapp}` },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex items-start gap-4">
                <Icon className="w-6 h-6 text-[var(--color-primary)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[var(--color-text-main)] mb-1">{label}</h4>
                  {text.split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-[var(--color-text-muted)] m-0 leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
