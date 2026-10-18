import { Sparkles, Heart, ShieldCheck, MapPin, Phone, Clock, Award, Users, CheckCircle2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import ImageWithFallback from '../components/common/ImageWithFallback';

export default function About() {
  const { companyDetails } = useCompany();
  return (
    <div className="min-h-screen py-12 bg-stone-50/50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Story Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Established in {companyDetails.establishedYear}</span>
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
              About {companyDetails.shopName}
            </h1>
            <p className="font-serif italic text-rose-600 dark:text-rose-400 text-lg">
              {companyDetails.shopNameTamil} — Tradition, Beauty & Festive Elegance.
            </p>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Founded with a passion to bring traditional South Indian festive adornments and modern beauty essentials under one roof,{' '}
              <strong className="text-stone-900 dark:text-stone-100">{companyDetails.shopName}</strong> has become the neighborhood’s beloved destination for bridal bangles, matte gold imitation jewelry, trending cosmetics, and thoughtful gifts.
            </p>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              We understand that every celebration — whether a wedding muhurtham, baby shower (valaikappu), temple festival, or birthday — is crowned by the right jewelry and accessories. Our experienced staff takes immense joy in assisting families with custom bangle matching, saree coordination, and bridal vanity preparations.
            </p>

            {/* Core Values Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {[
                'Specialized Bridal Bangle Customization',
                'Exquisite 1-Gram Matte Gold Finish',
                'Original Brand Cosmetics & Skincare',
                'Personalized In-Store Color Matching',
              ].map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Brand Showcase Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-white dark:bg-stone-900">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1611591475852-5a4ceaa09e53?auto=format&fit=crop&w=800&q=80"
                alt="Store ambiance and bridal collection"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                <div className="flex items-center gap-3">
                  <img src={companyDetails.logo} alt="Logo" className="w-10 h-10 object-contain bg-white/20 p-1 rounded-xl" />
                  <div>
                    <h3 className="font-serif text-lg font-bold m-0">{companyDetails.shopName}</h3>
                    <p className="text-xs text-rose-200 m-0">{companyDetails.tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Departments Overview */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Inside Our Showroom
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Curated Departments For Every Need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-stone-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                Bridal Bangle Studio
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed m-0">
                Velvet chudas, silk-thread custom sets, glass bangles in 50+ colors, and Kundan stone designer sets.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-stone-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                Temple & Antique Jewelry
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed m-0">
                Kasu harams, bridal chokers, Kemp stone vankis, hip chains (oddiyanam), and statement jhumkas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-stone-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                Cosmetics & Salon Care
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed m-0">
                Top brands of matte lipsticks, foundations, organic herbal kajals, nail lacquers, and mehendi cones.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-stone-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                Gifts & Clutches Studio
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed m-0">
                Embroidered potlis, party clutches, return gift sets, toys, attars, and custom celebration hampers.
              </p>
            </div>
          </div>
        </div>

        {/* Business Credentials Card */}
        <div className="p-8 rounded-3xl bg-stone-100/70 dark:bg-stone-900 border border-rose-100 dark:border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Physical Storefront
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 m-0 leading-relaxed">
                  {companyDetails.address.street}, {companyDetails.address.landmark}, {companyDetails.address.city} - {companyDetails.address.pincode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Store Hours
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 m-0 leading-relaxed">
                  {companyDetails.businessHours[0].days}: {companyDetails.businessHours[0].hours}
                  <br />
                  {companyDetails.businessHours[1].days}: {companyDetails.businessHours[1].hours}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Customer Assistance
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 m-0 leading-relaxed">
                  Phone: {companyDetails.contact.primaryPhone}
                  <br />
                  WhatsApp: {companyDetails.contact.whatsapp}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
