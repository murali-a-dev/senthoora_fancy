/**
 * Centralized Global Company Details Configuration
 * Sri Senthoora Fancy Store (ஸ்ரீ செந்தூரா ஃபேன்சி ஸ்டோர்)
 * 
 * Reusable across the entire application:
 * - Public Storefront (Home, Products, About, Contact)
 * - Navigation header, Mobile drawer, and Footer
 * - Admin Panel Showcase Editor & Settings
 */

export const companyDetails = {
  shopName: "Sri Senthoora Fancy Store",
  shopNameTamil: "ஸ்ரீ செந்தூரா பேன்சி ஸ்டோர்",
  tagline: "Exquisite Bangles, Bridal Accessories, Cosmetics & Gifts",
  shortDescription:
    "Sri Senthoora Fancy Store is your premier neighborhood destination for bridal bangles, designer imitation jewelry, beauty cosmetics, hair accessories, luxury handbags, and celebratory gifts.",
  establishedYear: 2018,

  // Branding Assets
  logo: "/logo_2.png",
  logoAlt: "Sri Senthoora Fancy Store Logo",
  emblemIcon: "sparkles",

  // Contact Information
  contact: {
    primaryPhone: "+91 98425 67890",
    primaryPhoneRaw: "9842567890",
    secondaryPhone: "+91 94432 12345",
    whatsapp: "+91 98425 67890",
    whatsappRaw: "919842567890",
    whatsappMessage: "Hello Sri Senthoora Fancy Store, I saw your product showcase and would like to know more details.",
    email: "contact@senthoorafancy.com",
    inquiryEmail: "inquiries@senthoorafancy.com",
  },

  // Physical Location & Directions
  address: {
    street: "No. 42/B, Bazaar Main Street",
    landmark: "Opposite Sri Mariamman Temple Arch",
    area: "Town Center",
    city: "Erode",
    state: "Tamil Nadu",
    pincode: "638001",
    country: "India",
    googleMapsQuery: "Bazaar+Main+Street+Erode+Tamil+Nadu",
    googleMapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.968603417751!2d77.7274!3d11.3410!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f30a911a3d9%3A0x6b89e7c53d0d62d!2sBazaar%20St%2C%20Erode%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  },

  // Business Hours
  businessHours: [
    { days: "Monday - Saturday", hours: "09:30 AM – 09:30 PM", isOpen: true },
    { days: "Sunday", hours: "10:00 AM – 08:30 PM", isOpen: true },
    { days: "Festive Days", hours: "09:00 AM – 10:30 PM (Special Timings)", isOpen: true },
  ],

  // Store Highlights / USPs
  highlights: [
    {
      title: "Bridal Bangles & Chuda Special",
      description: "Custom velvet bangle sets, matching bridal stone bangles, and silk-thread bridal sets tailored to your saree shade.",
      icon: "Crown",
    },
    {
      title: "Premium 1-Gram Gold & Antique Jewelry",
      description: "Intricately finished temple jewelry, matte gold harams, jhumkas, and chokers for weddings and celebrations.",
      icon: "Gem",
    },
    {
      title: "Top-Brand Cosmetics & Skincare",
      description: "100% original cosmetics, herbal kajals, nail polishes, mehendi cones, and bridal makeup essentials.",
      icon: "Sparkles",
    },
    {
      title: "Handbags, Hair Accessories & Gifts",
      description: "Trending clutch purses, stylish tote bags, claw clips, fancy stationery, and ready-to-gift festive sets.",
      icon: "Gift",
    },
  ],

  // Product Showcase Categories
  categories: [
    { id: "all", name: "All Showcase", count: "80+", icon: "Sparkles" },
    { id: "bangles", name: "Bangles & Chuda", count: "30+", icon: "CircleDot" },
    { id: "jewelry", name: "Imitation & Antique Jewelry", count: "25+", icon: "Gem" },
    { id: "cosmetics", name: "Cosmetics & Skincare", count: "20+", icon: "Sparkles" },
    { id: "hair-accessories", name: "Hair Accessories & Clips", count: "18+", icon: "Crown" },
    { id: "handbags", name: "Clutches & Handbags", count: "15+", icon: "ShoppingBag" },
    { id: "gifts", name: "Gift Articles & Toys", count: "16+", icon: "Gift" },
    { id: "perfumes", name: "Perfumes & Attars", count: "12+", icon: "Flame" },
  ],

  // Social Links
  socials: {
    instagram: "https://instagram.com/sri_senthoora_fancy",
    facebook: "https://facebook.com/srisenthoorafancy",
    whatsappChannel: "https://whatsapp.com/channel/senthoorafancy",
    youtube: "https://youtube.com/@senthoorafancy",
  },

  // Showcase Note / Disclaimer
  disclaimer:
    "Notice: Sri Senthoora Fancy Store operates as a physical retail experience. Prices and rates showcased on this website are for customer reference and display purposes only. We do not provide online checkout, cart, or payment transactions. Please visit our store in person or contact us on WhatsApp for product inquiries and in-store availability.",
};

export default companyDetails;
