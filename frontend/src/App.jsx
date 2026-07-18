import React, { useState, useEffect, useRef } from 'react';

// API Configuration & Hybrid Fallback
const API_BASE = 'http://localhost:5000/api';

// Inline SVG Icon components for absolute zero-dependency safety and high performance
const Icons = {
  Food: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Rider: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
      <path d="M12 18V9h4l2 3" />
      <path d="m8 6 4-4 4 4" />
      <path d="M12 2v10" />
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Heart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  Leaf: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
      <path d="M9 22v-4h4" />
    </svg>
  ),
  Water: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7Z" />
    </svg>
  ),
  LogOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Sun: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  Info: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Tv: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  ),
  Award: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing'); // landing, login, app
  const [authStep, setAuthStep] = useState('phone'); // phone, otp, register
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [roleInput, setRoleInput] = useState('recipient');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global State
  const [listings, setListings] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [impactData, setImpactData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showQRClaim, setShowQRClaim] = useState(null); // store claimed listing item
  const [smsLogs, setSmsLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), from: 'System Gateway', to: 'All', body: 'Welcome to ShareBite. Active virtual SMS simulation is live. Try requesting an OTP!' }
  ]);
  const [showVirtualPhone, setShowVirtualPhone] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'assistant', text: '👋 Hello! I am the ShareBite AI Assistant. I can explain platform rules, NGO tokens, rider payout processes, and how the spoilage safety gate is calculated. Ask me anything!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const handleSendChatMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: data.reply, guarded: data.guarded }]);
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      // Mock local keyword retrieval if server is offline
      const lower = textToSend.toLowerCase();
      let response = '🤖 [Offline fallback] I am currently operating offline. Swear word filters are active. Try asking about: food temperature, dairy preservation, meat guidelines, allergens, or produce storage.';
      
      const swears = ['fuck', 'shit', 'asshole', 'bitch', 'idiot', 'stupid', 'dick', 'hate', 'kill'];
      if (swears.some(s => lower.includes(s))) {
        response = '⚠️ [Offline Guardrail Warning] Toxic or abusive words are blocked by the guardrail. Please maintain professional conversation.';
      } else if (lower.includes('spoilage') || lower.includes('score') || lower.includes('safety') || lower.includes('formula')) {
        response = '🤖 **Offline RAG (Spoilage Scoring)**:\nScore = Prep age (+8 pts/hr, max 40) + Temp (+25 for >35°C, +15 for >30°C, +5 for >25°C) + Food Type (+20 liquid, +12 cooked, +3 dry) + Packaging (+25 open, +10 closed, +0 sealed).\n- <40: Low Risk (Auto-approved)\n- 40-69: Medium Risk (2-hour limit)\n- >=70: High Risk (Blocked)';
      } else if (lower.includes('token') || lower.includes('ngo')) {
        response = '🤖 **Offline RAG (Tokens)**:\nNGOs start with 5 tokens. 1 token is deducted per claim. Tokens are refunded upon successful pickup/delivery.';
      } else if (lower.includes('rider') || lower.includes('pay') || lower.includes('earning')) {
        response = '🤖 **Offline RAG (Riders)**:\nRiders get flat fee + distance bonuses. They need to enter the donor pickup code to load food, and recipient drop-off code to get paid.';
      } else if (lower.includes('donor') || lower.includes('individual') || lower.includes('limit') || lower.includes('hour')) {
        response = '🤖 **Offline RAG (Individual Donors)**:\nIndividual listings must be claimed and picked up within 2 hours, otherwise they are flagged.';
      } else if (lower.includes('temp') || lower.includes('cold') || lower.includes('hot') || lower.includes('danger zone') || lower.includes('fridge')) {
        response = '🤖 **Offline RAG (Temperature Standards)**:\n- Hot holding: Above 60°C (140°F)\n- Cold holding: Below 4°C (40°F)\n- Frozen: Below -18°C (0°F)\n- Danger Zone: Between 4°C and 60°C. High-risk food in this zone for >2h must be discarded.';
      } else if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') || lower.includes('liquid')) {
        response = '🤖 **Offline RAG (Dairy Preservation)**:\nInsulated transport at or below 4°C required. Spoilage gate adds +20 risk modifier due to fast spoilage bounds.';
      } else if (lower.includes('meat') || lower.includes('chicken') || lower.includes('beef') || lower.includes('poultry') || lower.includes('fish')) {
        response = '🤖 **Offline RAG (Meat/Poultry)**:\nCooked meats must reach 74°C internal temp. Raw meats must be separate from cooked to avoid cross-contamination.';
      } else if (lower.includes('allergen') || lower.includes('allergy') || lower.includes('peanut') || lower.includes('nut') || lower.includes('wheat') || lower.includes('gluten')) {
        response = '🤖 **Offline RAG (Allergen safety)**:\nTrack major allergens (peanuts, milk, soy, wheat, fish, tree nuts). Prevent cross-contact by preparing separately and declaration labels.';
      } else if (lower.includes('produce') || lower.includes('fruit') || lower.includes('vegetable') || lower.includes('veg') || lower.includes('fresh')) {
        response = '🤖 **Offline RAG (Produce)**:\nInspect visually for bruising/mold. Leafy greens kept under 4°C. Advise recipients to wash before consumption.';
      } else if (lower.includes('vegetarian') || lower.includes('vegan') || lower.includes('halal') || lower.includes('kosher') || lower.includes('diet')) {
        response = '🤖 **Offline RAG (Dietary Profiles)**:\nSupport filters for Vegetarian (no meat/fish), Vegan (plant-only), Halal (no pork/alcohol), and Kosher (no pork/shellfish/mix dairy-meat).';
      }
      
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: response }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Interactive landing page calculator states
  const [estimateMeals, setEstimateMeals] = useState(120);
  const [demoPrepAge, setDemoPrepAge] = useState(2); // hours
  const [demoCat, setDemoCat] = useState('cooked');
  const [demoTemp, setDemoTemp] = useState(28);
  const [demoPack, setDemoPack] = useState('closed');

  // Compute live demo risk score
  const getDemoRisk = () => {
    let score = 0;
    score += Math.min(demoPrepAge * 8, 40);
    if (demoTemp > 35) score += 25;
    else if (demoTemp > 30) score += 15;
    else if (demoTemp > 25) score += 5;
    if (demoCat === 'liquid') score += 20;
    else if (demoCat === 'cooked') score += 12;
    else score += 3;
    if (demoPack === 'open') score += 25;
    else if (demoPack === 'closed') score += 10;
    
    score = Math.min(Math.max(Math.round(score), 0), 100);
    let level = 'low';
    if (score >= 70) level = 'high';
    else if (score >= 40) level = 'medium';
    return { score, level };
  };
  const demoRisk = getDemoRisk();

  const addSmsLog = (to, body, from = 'ShareBite Gateway') => {
    setSmsLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        from,
        to,
        body
      },
      ...prev
    ]);
    setShowVirtualPhone(true);
  };

  // Form States (Donor Post Listing)
  const [newListingTitle, setNewListingTitle] = useState('');
  const [newListingDesc, setNewListingDesc] = useState('');
  const [newListingQty, setNewListingQty] = useState('');
  const [newListingPrep, setNewListingPrep] = useState('');
  const [newListingExp, setNewListingExp] = useState('');
  const [newListingTimeWindow, setNewListingTimeWindow] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [foodCategory, setFoodCategory] = useState('cooked');
  const [weatherTemp, setWeatherTemp] = useState('28');
  const [packagingType, setPackagingType] = useState('closed');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600');

  const photoPresets = [
    { name: 'Roti & Paneer', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600' },
    { name: 'Veg Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600' },
    { name: 'Green Salad', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' },
    { name: 'Cheese Pizza', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600' },
    { name: 'Fruit Salad', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600' },
    { name: 'Artisan Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600' }
  ];

  const handleAIScanListing = () => {
    const desc = (newListingDesc + " " + newListingTitle).toLowerCase();
    const detectedAllergens = [];
    const detectedDietary = [];
    
    if (desc.includes('paneer') || desc.includes('milk') || desc.includes('cream') || desc.includes('cheese') || desc.includes('butter') || desc.includes('dairy') || desc.includes('curd')) {
      detectedAllergens.push('dairy');
    }
    if (desc.includes('roti') || desc.includes('bread') || desc.includes('wheat') || desc.includes('flour') || desc.includes('maida') || desc.includes('naan') || desc.includes('pasta') || desc.includes('macaroni')) {
      detectedAllergens.push('gluten');
    }
    if (desc.includes('peanut') || desc.includes('almond') || desc.includes('cashew') || desc.includes('walnut') || desc.includes('nut') || desc.includes('pistachio')) {
      detectedAllergens.push('nuts');
    }
    if (desc.includes('soy') || desc.includes('tofu') || desc.includes('soya')) {
      detectedAllergens.push('soy');
    }
    if (desc.includes('egg') || desc.includes('omelet')) {
      detectedAllergens.push('eggs');
    }

    if (desc.includes('chicken') || desc.includes('meat') || desc.includes('beef') || desc.includes('pork') || desc.includes('fish') || desc.includes('mutton') || desc.includes('seafood')) {
      detectedDietary.push('non-veg');
    } else {
      detectedDietary.push('veg');
    }
    if (desc.includes('protein') || desc.includes('paneer') || desc.includes('tofu') || desc.includes('chicken') || desc.includes('lentil') || desc.includes('dal') || desc.includes('bean')) {
      detectedDietary.push('high protein');
    }
    if (desc.includes('sugar') || desc.includes('diet') || desc.includes('salad') || desc.includes('oats') || desc.includes('khichdi') || desc.includes('diabetic')) {
      detectedDietary.push('diabetic safe');
    }

    setSelectedAllergens(detectedAllergens);
    setSelectedDietary(detectedDietary);
    
    // Auto-predict photo based on keywords
    if (desc.includes('biryani') || desc.includes('rice') || desc.includes('pulao')) {
      setSelectedPhotoUrl(photoPresets[1].url);
    } else if (desc.includes('fruit') || desc.includes('apple') || desc.includes('banana') || desc.includes('orange') || desc.includes('berry')) {
      setSelectedPhotoUrl(photoPresets[4].url);
    } else if (desc.includes('pizza') || desc.includes('pasta') || desc.includes('macaroni') || desc.includes('cheese')) {
      setSelectedPhotoUrl(photoPresets[3].url);
    } else if (desc.includes('bread') || desc.includes('toast') || desc.includes('bun')) {
      setSelectedPhotoUrl(photoPresets[5].url);
    } else if (desc.includes('curry') || desc.includes('roti') || desc.includes('paneer') || desc.includes('masala')) {
      setSelectedPhotoUrl(photoPresets[0].url);
    } else if (desc.includes('salad') || desc.includes('green') || desc.includes('cucumber') || desc.includes('veg')) {
      setSelectedPhotoUrl(photoPresets[2].url);
    }

    setSuccessMsg(`🤖 AI Scanner: Auto-detected allergens [${detectedAllergens.join(', ') || 'none'}], predicted diet [${detectedDietary.join(', ') || 'none'}], and matched photo preset!`);
  };

  // Rider confirmation codes
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [deliveryCodeInput, setDeliveryCodeInput] = useState('');

  // Fallback Local Mock Database for Instant Loading / If Backend is offline
  const mockDb = useRef({
    users: [
      { id: 'donor1', phone: '9876543210', role: 'donor', name: 'Aarav Sharma', score: 120, streak: 3 },
      { id: 'inst1', phone: '8765432109', role: 'institution', name: 'Grand Pavilion Restaurant', score: 450, streak: 12, details: { address: '12, MG Road, Bangalore', outletCount: 3, tier: 'Gold Partner' }, verified: true },
      { id: 'recipient1', phone: '7654321098', role: 'recipient', name: 'Community Care NGO', tokens: 8 },
      { id: 'recipient2', phone: '7654321099', role: 'recipient', name: 'Raju (Feature Phone User)', tokens: 3 },
      { id: 'delivery1', phone: '6543210987', role: 'delivery', name: 'Karthik Kumar', verified: true, score: 95 },
      { id: 'admin1', phone: '9999999999', role: 'admin', name: 'System Admin' }
    ],
    listings: [
      {
        id: 'list1',
        donorId: 'inst1',
        donorName: 'Grand Pavilion Restaurant',
        title: 'Freshly Baked Roti & Paneer Curry',
        description: '15 portions of Paneer Butter Masala with Butter Rotis. Packed separately in food-grade containers.',
        quantity: '15 portions',
        prepTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        pickupWindow: '22:00 - 23:30',
        allergens: ['dairy', 'gluten'],
        dietaryTags: ['veg', 'high protein'],
        status: 'available',
        claimedBy: null,
        deliveryPartnerId: null,
        deliveryStatus: 'none',
        location: { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore' },
        riskScore: 23,
        riskLevel: 'low',
        pickupCode: '102938',
        deliveryCode: '582910',
        photo: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'list2',
        donorId: 'donor1',
        donorName: 'Aarav Sharma',
        title: 'Homemade Vegetable Khichdi',
        description: 'Delicious hot khichdi made at home. Suitable for 3-4 people. Please bring your own container if possible.',
        quantity: '4 portions',
        prepTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        expiryTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
        pickupWindow: '21:30 - 23:00',
        allergens: [],
        dietaryTags: ['veg', 'low sugar', 'diabetic safe'],
        status: 'available',
        claimedBy: null,
        deliveryPartnerId: null,
        deliveryStatus: 'none',
        location: { latitude: 12.9806, longitude: 77.6000, address: 'Indiranagar, Bangalore' },
        riskScore: 52,
        riskLevel: 'medium',
        pickupCode: '748291',
        deliveryCode: '918273',
        photo: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'list3',
        donorId: 'inst1',
        donorName: 'Grand Pavilion Restaurant',
        title: 'Vegetable Biryani Bulk Pack',
        description: 'Large tray of aromatic veg biryani. Serves around 25 people. Ideal for shelter home distribution.',
        quantity: '25 portions',
        prepTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        pickupWindow: '19:00 - 21:00',
        allergens: [],
        dietaryTags: ['veg', 'high calorie'],
        status: 'claimed',
        claimedBy: 'recipient1',
        deliveryPartnerId: 'delivery1',
        deliveryStatus: 'assigned',
        location: { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore' },
        riskScore: 32,
        riskLevel: 'low',
        pickupCode: '439201',
        deliveryCode: '887612',
        photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600'
      }
    ],
    deliveries: [
      {
        id: 'del1',
        listingId: 'list3',
        riderId: 'delivery1',
        status: 'accepted',
        pay: 60,
        pickupAddress: 'Grand Pavilion Restaurant, MG Road, Bangalore',
        dropAddress: 'Community Care NGO Center, Bangalore',
        pickupCode: '439201',
        deliveryCode: '887612',
        distance: 3.2,
        urgency: 'medium'
      }
    ],
    impacts: [
      { id: 'imp1', donorId: 'inst1', listingId: 'list4', mealsSaved: 30, carbonSaved: 75.0, waterSaved: 30000, recipientId: 'recipient1', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'imp2', donorId: 'donor1', listingId: 'list_prev', mealsSaved: 4, carbonSaved: 10.0, waterSaved: 4000, recipientId: 'recipient2', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
    ],
    alerts: [
      { id: 'alert1', area: 'Bangalore East', flagged: true, reason: 'High demand for liquid/soft food registered in this zone. (Possible public recovery zone)', createdAt: new Date().toISOString() }
    ]
  });

  // Ticking Expiry Timer refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize Lenis Smooth Scroll dynamically
  useEffect(() => {
    let lenisInstance = null;

    if (window.Lenis) {
      lenisInstance = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureOrientation: 'vertical',
        smooth: true,
        smoothTouch: false
      });

      function raf(time) {
        if (lenisInstance) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
      }
      requestAnimationFrame(raf);
    } else {
      console.warn("Lenis library not loaded yet. Falling back to native smooth scrolling.");
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      // 1. Initial Page Load Animations (Navbar and Hero)
      window.gsap.fromTo('.header', 
        { y: -80, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
      );

      if (currentPage === 'landing') {
        // Hero Content Stagger
        const tl = window.gsap.timeline();
        tl.fromTo('.hero-section h1', 
          { y: 60, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
        )
        .fromTo('.hero-section p', 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 
          '-=0.8'
        )
        .fromTo('.hero-section .btn, .hero-section a', 
          { scale: 0.9, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.15 }, 
          '-=0.6'
        );

        // 2. Scroll Triggered Cards
        window.gsap.fromTo('.landing-container .card', 
          { y: 100, opacity: 0 }, 
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            ease: 'power3.out', 
            stagger: 0.2,
            scrollTrigger: {
              trigger: '#interactive-tools',
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      if (currentPage === 'login') {
        // Login Wrapper Bounce
        window.gsap.fromTo('.auth-wrapper', 
          { scale: 0.92, opacity: 0, y: 40 }, 
          { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
        );
        
        // Role Cards Stagger
        window.gsap.fromTo('.role-card', 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1, delay: 0.2 }
        );
      }

      if (user) {
        // Logged-in Dashboard Entrance Animation
        window.gsap.fromTo('.dashboard-container .card, .dashboard-container .stat-card, .dashboard-container .active-jobs-list', 
          { y: 40, opacity: 0, scale: 0.97 }, 
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
        );

        // Stagger list elements and table rows
        window.gsap.fromTo('.dashboard-container .listing-card, .dashboard-container table tbody tr, .dashboard-container .delivery-card', 
          { y: 25, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.04, delay: 0.15, clearProps: 'transform' }
        );
      }
    }
  }, [currentPage, user]);

  // Fetch Data on Load or User Auth Change
  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      // 1. Fetch Listings
      const resList = await fetch(`${API_BASE}/listings`);
      if (resList.ok) {
        const data = await resList.json();
        setListings(data);
      } else {
        setListings(mockDb.current.listings);
      }

      // 2. Fetch Deliveries
      const resDel = await fetch(`${API_BASE}/deliveries`);
      if (resDel.ok) {
        const data = await resDel.json();
        setDeliveries(data);
      } else {
        setDeliveries(mockDb.current.deliveries);
      }

      // 3. Fetch Impact
      const resImp = await fetch(`${API_BASE}/impact`);
      if (resImp.ok) {
        const data = await resImp.json();
        setImpactData(data);
      } else {
        // Compute mock impact
        const totalMeals = mockDb.current.impacts.reduce((acc, c) => acc + c.mealsSaved, 0);
        const totalCarbon = mockDb.current.impacts.reduce((acc, c) => acc + c.carbonSaved, 0);
        const totalWater = mockDb.current.impacts.reduce((acc, c) => acc + c.waterSaved, 0);
        setImpactData({
          totalMealsSaved: totalMeals,
          totalCarbonSavedKg: totalCarbon,
          totalWaterSavedLiters: totalWater,
          stats: {
            institutions: mockDb.current.users.filter(u => u.role === 'institution').length,
            individuals: mockDb.current.users.filter(u => u.role === 'donor').length,
            recipients: mockDb.current.users.filter(u => u.role === 'recipient').length,
            riders: mockDb.current.users.filter(u => u.role === 'delivery').length
          }
        });
      }

      // 4. Fetch Health Alerts
      const resAlert = await fetch(`${API_BASE}/health/alerts`);
      if (resAlert.ok) {
        const data = await resAlert.json();
        setAlerts(data);
      } else {
        setAlerts(mockDb.current.alerts);
      }
    } catch (err) {
      console.warn("Could not connect to backend REST APIs. Switching to client-side database simulation.");
      // Fallback
      setListings(mockDb.current.listings);
      setDeliveries(mockDb.current.deliveries);
      
      const totalMeals = mockDb.current.impacts.reduce((acc, c) => acc + c.mealsSaved, 0);
      const totalCarbon = mockDb.current.impacts.reduce((acc, c) => acc + c.carbonSaved, 0);
      const totalWater = mockDb.current.impacts.reduce((acc, c) => acc + c.waterSaved, 0);
      setImpactData({
        totalMealsSaved: totalMeals,
        totalCarbonSavedKg: totalCarbon,
        totalWaterSavedLiters: totalWater,
        stats: {
          institutions: mockDb.current.users.filter(u => u.role === 'institution').length,
          individuals: mockDb.current.users.filter(u => u.role === 'donor').length,
          recipients: mockDb.current.users.filter(u => u.role === 'recipient').length,
          riders: mockDb.current.users.filter(u => u.role === 'delivery').length
        }
      });
      setAlerts(mockDb.current.alerts);
    }
  };

  // Auth Handling
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phoneInput) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, role: roleInput })
      });
      if (res.ok) {
        const data = await res.json();
        setAuthStep('otp');
        if (data.demo) {
          setSuccessMsg(`[Demo Mode] SMS sent! Enter code ${data.code} to verify.`);
          addSmsLog(phoneInput, `Your ShareBite verification code is: ${data.code}. Valid for 5 minutes.`, 'ShareBite OTP');
        } else {
          setSuccessMsg(`SMS Verification OTP sent successfully to ${phoneInput}! Check your SMS inbox or virtual logs.`);
          addSmsLog(phoneInput, `Your ShareBite verification code is: ${data.code}. (Sent via SMS Gateway)`, 'ShareBite OTP');
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setAuthStep('otp');
      setSuccessMsg(`[Offline Mode] SMS sent to ${phoneInput}! Enter code 123456 to verify.`);
      addSmsLog(phoneInput, `Your offline fallback verification code is: 123456. Valid for 5 minutes.`, 'Offline Gateway');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpInput) {
      setErrorMsg('Please enter the OTP.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, otp: otpInput, role: roleInput, name: nameInput })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCurrentPage('app');
        setSuccessMsg('Logged in successfully!');
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'OTP failed');
      }
    } catch (err) {
      // Offline fallback verification
      if (otpInput === '123456') {
        let existing = mockDb.current.users.find(u => u.phone === phoneInput);
        if (!existing) {
          existing = {
            id: 'u_' + Math.random().toString(36).substr(2, 5),
            phone: phoneInput,
            role: roleInput,
            name: nameInput || `User ${phoneInput.slice(-4)}`,
            tokens: (roleInput === 'recipient') ? 5 : 0,
            score: 0,
            streak: 0,
            verified: (roleInput === 'institution' || roleInput === 'delivery') ? false : true
          };
          mockDb.current.users.push(existing);
        }
        setUser(existing);
        setCurrentPage('app');
        setSuccessMsg('Logged in successfully (Simulated)!');
      } else {
        setErrorMsg('Invalid OTP. Use code 123456 for testing.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
    setAuthStep('phone');
    setPhoneInput('');
    setOtpInput('');
    setNameInput('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  // Submit Listing
  const handlePostListing = async (e) => {
    e.preventDefault();
    if (!newListingTitle || !newListingQty || !newListingPrep || !newListingExp) {
      setErrorMsg('Please fill in all mandatory listing fields.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    
    // Calculate risk local representation
    let score = 0;
    const hours = (new Date() - new Date(newListingPrep)) / (1000 * 60 * 60);
    score += Math.min(hours * 8, 40);
    if (parseFloat(weatherTemp) > 35) score += 25;
    else if (parseFloat(weatherTemp) > 30) score += 15;
    else if (parseFloat(weatherTemp) > 25) score += 5;
    if (foodCategory === 'liquid') score += 20;
    else if (foodCategory === 'cooked') score += 12;
    else score += 3;
    if (packagingType === 'open') score += 25;
    else if (packagingType === 'closed') score += 10;
    
    score = Math.min(Math.max(Math.round(score), 0), 100);
    let level = 'low';
    if (score >= 70) level = 'high';
    else if (score >= 40) level = 'medium';

    if (level === 'high') {
      setErrorMsg('Listing BLOCKED: Health Risk Score is too HIGH (Spoilage danger). Please post food closer to prep time or with better sealed packaging.');
      return;
    }

    const payload = {
      donorId: user.id,
      title: newListingTitle,
      description: newListingDesc,
      quantity: newListingQty,
      prepTime: newListingPrep,
      expiryTime: newListingExp,
      pickupWindow: newListingTimeWindow || 'Within 2 hours',
      allergens: selectedAllergens,
      dietaryTags: selectedDietary,
      category: foodCategory,
      weatherTemp,
      packaging: packagingType,
      location: { latitude: 12.9716, longitude: 77.5946, address: user.details?.address || 'MG Road, Bangalore' },
      photo: selectedPhotoUrl
    };

    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccessMsg('Food listed successfully!');
        resetListingForm();
        refreshData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Server rejected');
      }
    } catch (err) {
      // Mock insert
      const mockItem = {
        id: 'list_' + Math.random().toString(36).substr(2, 5),
        donorId: user.id,
        donorName: user.name,
        title: newListingTitle,
        description: newListingDesc,
        quantity: newListingQty,
        prepTime: newListingPrep,
        expiryTime: (level === 'medium') ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : newListingExp,
        pickupWindow: newListingTimeWindow || 'Immediate',
        allergens: selectedAllergens,
        dietaryTags: selectedDietary,
        status: 'available',
        claimedBy: null,
        deliveryPartnerId: null,
        deliveryStatus: 'none',
        location: { latitude: 12.9716, longitude: 77.5946, address: user.details?.address || 'MG Road, Bangalore' },
        riskScore: score,
        riskLevel: level,
        pickupCode: Math.floor(100000 + Math.random() * 90000).toString(),
        deliveryCode: Math.floor(100000 + Math.random() * 90000).toString(),
        photo: selectedPhotoUrl
      };
      
      mockDb.current.listings.unshift(mockItem);
      
      // Update donor score/streak
      user.score = (user.score || 0) + 15;
      user.streak = (user.streak || 0) + 1;
      
      setSuccessMsg('Food listed successfully (Simulated Mode)!');
      if (level === 'medium') {
        setSuccessMsg('Food listed. Warning: Elevated risk score. Auto-expiry set to 2 hours for harm reduction.');
      }
      resetListingForm();
      refreshData();
    }
  };

  const resetListingForm = () => {
    setNewListingTitle('');
    setNewListingDesc('');
    setNewListingQty('');
    setNewListingPrep('');
    setNewListingExp('');
    setNewListingTimeWindow('');
    setSelectedAllergens([]);
    setSelectedDietary([]);
    setFoodCategory('cooked');
    setPackagingType('closed');
  };

  // Claim Listing
  const handleClaimListing = async (listingId, requestDelivery) => {
    if (!user) return;
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await fetch(`${API_BASE}/listings/${listingId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: user.id, requestDelivery })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg('Food claimed! Token deducted.');
        setShowQRClaim(data.listing);
        addSmsLog(user.phone, `ShareBite: Food "${data.listing.title}" claimed. Drop-off code: ${data.listing.deliveryCode}. Pickup code: ${data.listing.pickupCode}.`, 'ShareBite Logistics');
        refreshData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error claiming');
      }
    } catch (err) {
      // Mock Claim
      if (user.role === 'recipient' && user.tokens <= 0) {
        setErrorMsg('Error: Out of tokens. You need at least 1 token to claim meals.');
        return;
      }
      
      const item = mockDb.current.listings.find(l => l.id === listingId);
      if (item) {
        item.status = 'claimed';
        item.claimedBy = user.id;
        if (requestDelivery) {
          item.deliveryStatus = 'pending';
          mockDb.current.deliveries.push({
            id: 'del_' + Math.random().toString(36).substr(2, 5),
            listingId: item.id,
            riderId: null,
            status: 'pending',
            pay: 55,
            pickupAddress: item.location.address,
            dropAddress: 'NGO Drop Center, Bengaluru',
            pickupCode: item.pickupCode,
            deliveryCode: item.deliveryCode,
            distance: 2.8,
            urgency: item.riskLevel === 'medium' ? 'high' : 'medium'
          });
        }
        
        if (user.role === 'recipient') {
          user.tokens -= 1;
        }

        // Area Health alert check
        if (item.dietaryTags.includes('liquid') || item.dietaryTags.includes('diabetic safe')) {
          mockDb.current.alerts.push({
            id: 'al_' + Date.now(),
            area: 'Bangalore Central',
            flagged: true,
            reason: 'Frequent soft/liquid and diabetic-safe food items claims flagged. Public health monitoring advised.',
            createdAt: new Date().toISOString()
          });
        }

        setSuccessMsg('Food claimed successfully (Simulated)!');
        setShowQRClaim(item);
        addSmsLog(user.phone, `ShareBite: Food "${item.title}" claimed. Drop-off code: ${item.deliveryCode}. Pickup code: ${item.pickupCode}.`, 'ShareBite Logistics');
        refreshData();
      }
    }
  };

  // Delivery rider controls
  const handleAcceptJob = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/deliveries/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId: user.id })
      });
      if (res.ok) {
        setSuccessMsg('Delivery assigned to you!');
        const job = deliveries.find(d => d.id === jobId);
        if (job) {
          addSmsLog(user.phone, `ShareBite: Delivery accepted. Pickup code: ${job.pickupCode}. Location: ${job.pickupAddress}.`, 'Rider Dispatch');
        }
        refreshData();
      }
    } catch (err) {
      const job = mockDb.current.deliveries.find(d => d.id === jobId);
      if (job) {
        job.status = 'accepted';
        job.riderId = user.id;
        const list = mockDb.current.listings.find(l => l.id === job.listingId);
        if (list) {
          list.deliveryPartnerId = user.id;
          list.deliveryStatus = 'assigned';
        }
        setSuccessMsg('Delivery accepted (Simulated)!');
        addSmsLog(user.phone, `ShareBite: Delivery accepted. Pickup code: ${job.pickupCode}. Location: ${job.pickupAddress}.`, 'Rider Dispatch');
        refreshData();
      }
    }
  };

  const handleVerifyPickup = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/deliveries/${jobId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pickupCodeInput })
      });
      if (res.ok) {
        setSuccessMsg('Pickup confirmed! Start delivery route.');
        setPickupCodeInput('');
        const job = deliveries.find(d => d.id === jobId);
        if (job) {
          addSmsLog(user.phone, `ShareBite: Food loaded. Deliver to recipient. Verification drop code: ${job.deliveryCode}.`, 'Rider Dispatch');
        }
        refreshData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Wrong pickup code');
      }
    } catch (err) {
      const job = mockDb.current.deliveries.find(d => d.id === jobId);
      if (job && job.pickupCode === pickupCodeInput) {
        job.status = 'picked_up';
        const list = mockDb.current.listings.find(l => l.id === job.listingId);
        if (list) list.deliveryStatus = 'picked_up';
        setSuccessMsg('Pickup verified! Food is in transit (Simulated).');
        setPickupCodeInput('');
        addSmsLog(user.phone, `ShareBite: Food loaded. Deliver to recipient. Verification drop code: ${job.deliveryCode}.`, 'Rider Dispatch');
        refreshData();
      } else {
        setErrorMsg('Invalid code. Enter correct 6-digit donor code.');
      }
    }
  };

  const handleVerifyDelivery = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/deliveries/${jobId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: deliveryCodeInput })
      });
      if (res.ok) {
        setSuccessMsg('Delivery complete! Verification code accepted.');
        setDeliveryCodeInput('');
        const job = deliveries.find(d => d.id === jobId);
        if (job) {
          addSmsLog(user.phone, `ShareBite: Payout ₹${job.pay} credited. Delivery completed successfully!`, 'Rider Earnings');
        }
        refreshData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Wrong drop-off code');
      }
    } catch (err) {
      const job = mockDb.current.deliveries.find(d => d.id === jobId);
      if (job && job.deliveryCode === deliveryCodeInput) {
        job.status = 'completed';
        
        const list = mockDb.current.listings.find(l => l.id === job.listingId);
        if (list) {
          list.status = 'delivered';
          list.deliveryStatus = 'delivered';
          
          // Add to impacts
          const portions = parseInt(list.quantity) || 5;
          mockDb.current.impacts.push({
            id: 'imp_' + Math.random().toString(36).substr(2, 5),
            donorId: list.donorId,
            listingId: list.id,
            mealsSaved: portions,
            carbonSaved: portions * 2.5,
            waterSaved: portions * 1000,
            recipientId: list.claimedBy,
            createdAt: new Date().toISOString()
          });
        }
        
        user.score = (user.score || 0) + 10;
        setSuccessMsg('Delivery completed successfully! (Simulated)');
        setDeliveryCodeInput('');
        addSmsLog(user.phone, `ShareBite: Payout ₹${job.pay} credited. Delivery completed successfully!`, 'Rider Earnings');
        refreshData();
      } else {
        setErrorMsg('Invalid code. Enter recipient drop-off code.');
      }
    }
  };

  // Resolve Alert Admin Action
  const handleResolveAlert = async (alertId) => {
    try {
      await fetch(`${API_BASE}/health/alerts/${alertId}/resolve`, { method: 'POST' });
      refreshData();
    } catch (err) {
      mockDb.current.alerts = mockDb.current.alerts.filter(a => a.id !== alertId);
      refreshData();
    }
  };

  // Helper formatting countdown timers
  const getCountdown = (expTime) => {
    const diff = new Date(expTime) - new Date();
    if (diff <= 0) return 'Expired';
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // Toggle Allergen selection
  const toggleAllergen = (all) => {
    if (selectedAllergens.includes(all)) {
      setSelectedAllergens(selectedAllergens.filter(a => a !== all));
    } else {
      setSelectedAllergens([...selectedAllergens, all]);
    }
  };

  // Toggle Dietary selection
  const toggleDietary = (diet) => {
    if (selectedDietary.includes(diet)) {
      setSelectedDietary(selectedDietary.filter(d => d !== diet));
    } else {
      setSelectedDietary([...selectedDietary, diet]);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER NAVBAR */}
      <header className="header">
        <div className="logo" onClick={() => { setSelectedListing(null); if (!user) setCurrentPage('landing'); }}>
          <span>ShareBite</span>
        </div>
        
        {/* Public Nav Menu (Only when logged out and on landing page) */}
        {!user && currentPage === 'landing' && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontFamily: 'var(--font-label)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="hidden md:flex">
            <a href="#interactive-tools" className="text-secondary hover:text-primary transition-colors" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Safety Gate</a>
            <a href="#interactive-tools" className="text-secondary hover:text-primary transition-colors" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>ESG Metrics</a>
            <a href="#" className="text-secondary hover:text-primary transition-colors" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Manifesto</a>
          </div>
        )}

        <div className="nav-right">
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 12px' }} 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          {!user && currentPage === 'landing' && (
            <button 
              className="btn btn-primary" 
              style={{ padding: '8px 18px', fontSize: '0.75rem' }}
              onClick={() => setCurrentPage('login')}
            >
              Join the Table
            </button>
          )}

          {!user && currentPage === 'login' && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 18px', fontSize: '0.75rem' }}
              onClick={() => setCurrentPage('landing')}
            >
              ← Back to Home
            </button>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', display: 'block' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--primary)' }}>
                  {user.role} {user.verified && '✓'}
                </div>
              </div>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 12px' }} title="Log out">
                <Icons.LogOut />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        
        {/* Alerts Center */}
        {errorMsg && (
          <div className="badge badge-danger" style={{ display: 'flex', width: '100%', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px', fontSize: '0.9rem', justifyContent: 'flex-start', textAlign: 'left', lineHeight: '1.4' }}>
            <Icons.Alert /> <span style={{ marginLeft: '8px' }}>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="badge badge-success" style={{ display: 'flex', width: '100%', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px', fontSize: '0.9rem', justifyContent: 'flex-start', textAlign: 'left' }}>
            <Icons.Check /> <span style={{ marginLeft: '8px' }}>{successMsg}</span>
          </div>
        )}

        {/* 1. AUTH SCREEN / LANDING PAGE (Logged out) */}
        {!user && currentPage === 'landing' && (
          <div className="landing-container">
            {/* Hero Section */}
            <section className="hero-section glass-panel" style={{ padding: '60px 40px', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '500', lineHeight: '1.15', margin: '10px 0' }}>
                  Safe Food. Shared Dignity. <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero Waste.</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', margin: '20px 0' }}>
                  ShareBite bridges the gap between commercial surplus kitchens and vulnerable communities. Secured by a real-time time-temperature spoilage scoring system and a dignity-first logistics framework.
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary pulse-button" onClick={() => setCurrentPage('login')}>
                    Join the Table / Login
                  </button>
                  <a href="#interactive-tools" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                    Explore Safety Playground
                  </a>
                </div>
              </div>
              <div className="hidden lg:block" style={{ height: '360px', overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" 
                  alt="Realistic gourmet smoked catering platter" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </section>

            {/* Interactive Section: ESG Calculator & Spoilage Gate */}
            <section id="interactive-tools" className="grid-cols-2" style={{ marginBottom: '40px' }}>
              
              {/* Card 1: Interactive Carbon Calculator */}
              <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>🌱 Environmental Impact Estimator (B2B SaaS)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Drag the slider to estimate how local commercial kitchen savings scale to help meet ESG & CSR sustainability quotas.
                </p>

                <div className="form-group" style={{ margin: '20px 0 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="form-label" style={{ marginBottom: 0 }}>Meals Redirected / Day:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{estimateMeals} meals</strong>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10" 
                    value={estimateMeals} 
                    onChange={e => setEstimateMeals(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>

                <div className="grid-cols-2" style={{ gap: '12px' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>CO₂ Avoided</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '4px' }}>{(estimateMeals * 2.5).toFixed(1)} kg</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Water Conserved</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--info)', marginTop: '4px' }}>{(estimateMeals * 1000).toLocaleString()} L</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Spoilage Risk scoring Playground */}
              <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>🛡️ Preventive Spoilage Risk Playground</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Interact with the variables below to see how our rule-based algorithm ranks safety risk and enforces auto-approvals or blockages.
                </p>

                <div className="grid-cols-2" style={{ gap: '12px', marginTop: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="demo-prep-age">Hours since cooked</label>
                    <input 
                      type="number" 
                      id="demo-prep-age"
                      className="form-input" 
                      min="0" 
                      max="12" 
                      value={demoPrepAge} 
                      onChange={e => setDemoPrepAge(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="demo-temp">Ambient Temp (°C)</label>
                    <input 
                      type="number" 
                      id="demo-temp"
                      className="form-input" 
                      min="15" 
                      max="45" 
                      value={demoTemp} 
                      onChange={e => setDemoTemp(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="demo-cat">Food Type</label>
                    <select id="demo-cat" className="form-input" value={demoCat} onChange={e => setDemoCat(e.target.value)}>
                      <option value="dry">Dry Food (low risk)</option>
                      <option value="cooked">Hot Cooked (med risk)</option>
                      <option value="liquid">Liquid/Dairy (high risk)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="demo-pack">Container Packaging</label>
                    <select id="demo-pack" className="form-input" value={demoPack} onChange={e => setDemoPack(e.target.value)}>
                      <option value="sealed">Sealed Foil (safest)</option>
                      <option value="closed">Closed Lid</option>
                      <option value="open">Open Tray</option>
                    </select>
                  </div>
                </div>

                <div className="risk-indicator" style={{ marginBottom: 0, marginTop: '8px' }}>
                  <div className={`risk-circle ${demoRisk.level}`}>
                    {demoRisk.score}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Risk Category: {demoRisk.level.toUpperCase()}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {demoRisk.level === 'low' && '🟢 APPROVED: Auto-approved for redistribution.'}
                      {demoRisk.level === 'medium' && '🟡 EXPIRED FAST: Restricted to 2-hour window.'}
                      {demoRisk.level === 'high' && '🔴 BLOCKED: Auto-blocked by system safety gate.'}
                    </span>
                  </div>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* 1.5. DEDICATED LOGIN PORTAL (Logged out) */}
        {!user && currentPage === 'login' && (
          <section className="auth-wrapper glass-panel text-center" style={{ border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="auth-header">
              <h2>Access the Platform</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Sign in using simulated SMS OTP logs or verify with real carrier phone networks.</p>
            </div>
            
            {authStep === 'phone' && (
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label className="form-label">Select Your System Role</label>
                  <div className="role-cards-grid">
                    <div className={`role-card ${roleInput === 'recipient' ? 'active' : ''}`} onClick={() => setRoleInput('recipient')}>
                      <Icons.Heart />
                      <h4>Recipient / NGO</h4>
                    </div>
                    <div className={`role-card ${roleInput === 'donor' ? 'active' : ''}`} onClick={() => setRoleInput('donor')}>
                      <Icons.User />
                      <h4>Individual Donor</h4>
                    </div>
                    <div className={`role-card ${roleInput === 'institution' ? 'active' : ''}`} onClick={() => setRoleInput('institution')}>
                      <Icons.Tv />
                      <h4>Institution</h4>
                    </div>
                    <div className={`role-card ${roleInput === 'delivery' ? 'active' : ''}`} onClick={() => setRoleInput('delivery')}>
                      <Icons.Rider />
                      <h4>Rider Partner</h4>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone-auth">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone-auth"
                    className="form-input" 
                    placeholder="Enter phone number" 
                    value={phoneInput} 
                    onChange={e => setPhoneInput(e.target.value)} 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending SMS...' : 'Request Verification OTP'}
                </button>
              </form>
            )}

            {authStep === 'otp' && (
              <form onSubmit={handleVerifyOTP}>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Verification SMS sent. Review the virtual phone log overlay or enter code below.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="display-name">Full Name (Only required for new users)</label>
                  <input 
                    type="text" 
                    id="display-name"
                    className="form-input" 
                    placeholder="Enter your name" 
                    value={nameInput} 
                    onChange={e => setNameInput(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="otp-auth">6-Digit OTP Code</label>
                  <input 
                    type="text" 
                    id="otp-auth"
                    className="form-input" 
                    placeholder="Enter verification code" 
                    value={otpInput} 
                    onChange={e => setOtpInput(e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setAuthStep('phone')}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying...' : 'Verify & Enter'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* 2. LOGGED IN ROLE DASHBOARDS */}
        {user && (
          <div className="dashboard-container">
            
            {/* A. INDIVIDUAL DONOR DASHBOARD */}
            {user.role === 'donor' && (
              <div className="grid-cols-3">
                
                {/* Form column (Left) */}
                <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
                  <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icons.Plus /> Post Excess Edible Food
                  </h3>
                  <form onSubmit={handlePostListing}>
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="listing-title">Food Title / Item Name</label>
                        <input 
                          type="text" 
                          id="listing-title"
                          className="form-input" 
                          placeholder="e.g. 5 portions of Vegetable Curry" 
                          value={newListingTitle}
                          onChange={e => setNewListingTitle(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="listing-qty">Quantity</label>
                        <input 
                          type="text" 
                          id="listing-qty"
                          className="form-input" 
                          placeholder="e.g. 5 portions / 3 kg" 
                          value={newListingQty}
                          onChange={e => setNewListingQty(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="listing-desc">Short Description & Details</label>
                      <textarea 
                        id="listing-desc"
                        className="form-input" 
                        rows="3" 
                        placeholder="State food details, packaging type, and instructions..."
                        value={newListingDesc}
                        onChange={e => setNewListingDesc(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-12px', marginBottom: '16px' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px dashed var(--primary)' }}
                        onClick={handleAIScanListing}
                      >
                        🤖 Scan Description with ShareBite AI
                      </button>
                    </div>

                    <div className="grid-cols-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="listing-prep">Preparation Time</label>
                        <input 
                          type="datetime-local" 
                          id="listing-prep"
                          className="form-input"
                          value={newListingPrep}
                          onChange={e => setNewListingPrep(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="listing-exp">Estimated Expiry Time</label>
                        <input 
                          type="datetime-local" 
                          id="listing-exp"
                          className="form-input"
                          value={newListingExp}
                          onChange={e => setNewListingExp(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="pickup-window">Pickup Close Window</label>
                        <input 
                          type="text" 
                          id="pickup-window"
                          className="form-input" 
                          placeholder="e.g. 21:00 - 22:30" 
                          value={newListingTimeWindow}
                          onChange={e => setNewListingTimeWindow(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Safety Parameters (Crucial for Health scoring) */}
                    <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icons.Shield /> Food Safety & Risk Scoring Input parameters
                      </h4>
                      <div className="grid-cols-3">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="food-cat">Category</label>
                          <select className="form-input" id="food-cat" value={foodCategory} onChange={e => setFoodCategory(e.target.value)}>
                            <option value="dry">Dry Food (Breads/Biscuits)</option>
                            <option value="cooked">Cooked Hot Meals (Rice/Curry)</option>
                            <option value="liquid">Liquid/Dairy items</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="weather-temp">Ambient Temp (°C)</label>
                          <input type="number" id="weather-temp" className="form-input" value={weatherTemp} onChange={e => setWeatherTemp(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="packaging-type">Packaging Status</label>
                          <select className="form-input" id="packaging-type" value={packagingType} onChange={e => setPackagingType(e.target.value)}>
                            <option value="sealed">Sealed Container</option>
                            <option value="closed">Closed Container (Home)</option>
                            <option value="open">Open (Serving trays)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Allergens and Dietary Tags */}
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Allergens Present</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                          {['nuts', 'gluten', 'dairy', 'soy'].map(all => (
                            <button
                              type="button"
                              key={all}
                              className={`btn btn-outline ${selectedAllergens.includes(all) ? 'active' : ''}`}
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: selectedAllergens.includes(all) ? 'var(--primary)' : 'var(--border-color)', background: selectedAllergens.includes(all) ? 'var(--primary-light)' : '' }}
                              onClick={() => toggleAllergen(all)}
                            >
                              {all}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Nutrition & Health Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                          {['veg', 'non-veg', 'high protein', 'low sugar', 'diabetic safe'].map(diet => (
                            <button
                              type="button"
                              key={diet}
                              className={`btn btn-outline ${selectedDietary.includes(diet) ? 'active' : ''}`}
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: selectedDietary.includes(diet) ? 'var(--primary)' : 'var(--border-color)', background: selectedDietary.includes(diet) ? 'var(--primary-light)' : '' }}
                              onClick={() => toggleDietary(diet)}
                            >
                              {diet}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Realistic Photo Preset Selector */}
                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <label className="form-label">Select Realistic Presentation Image</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }} className="grid-cols-2 md:grid-cols-3">
                        {photoPresets.map(preset => (
                          <div 
                            key={preset.name}
                            onClick={() => setSelectedPhotoUrl(preset.url)}
                            style={{ 
                              position: 'relative', 
                              height: '90px', 
                              borderRadius: 'var(--radius-sm)', 
                              overflow: 'hidden', 
                              cursor: 'pointer',
                              border: selectedPhotoUrl === preset.url ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                              opacity: selectedPhotoUrl === preset.url ? 1 : 0.65,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0, 0, 0, 0.75)', color: '#ffffff', fontSize: '0.65rem', padding: '4px', textAlign: 'center' }}>
                              {preset.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                      Publish Food Listing (Verify Safety Guard)
                    </button>
                  </form>
                </div>

                {/* Score and stats column (Right) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card glass-panel" style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifycontent: 'center', margin: '0 auto 16px', justifyContent: 'center' }}>
                      <Icons.Award />
                    </div>
                    <h3 style={{ fontSize: '1.4rem' }}>Bronze Donor</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your contributions are making an impact.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{user.score}</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Donation Score</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>{user.streak} days</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Active Streak</div>
                      </div>
                    </div>
                  </div>

                  <div className="card glass-panel">
                    <h4 style={{ marginBottom: '16px' }}>Hygiene & Safety Nudges</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <li style={{ display: 'flex', gap: '8px' }}>
                        <Icons.Check /> Wash hands thoroughly before packing food.
                      </li>
                      <li style={{ display: 'flex', gap: '8px' }}>
                        <Icons.Check /> Use clean, food-grade containers.
                      </li>
                      <li style={{ display: 'flex', gap: '8px' }}>
                        <Icons.Check /> Ensure containers are shut tight to prevent leaks.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Listing history row (bottom span) */}
                <div style={{ gridColumn: 'span 3' }}>
                  <h3 style={{ marginBottom: '16px' }}>Your Live Listings</h3>
                  <div className="listings-grid">
                    {listings.filter(l => l.donorId === user.id).map(list => (
                      <div className="listing-card" key={list.id}>
                        <div className="listing-img-container">
                          <img src={list.photo} alt={list.title} className="listing-img" />
                          <div className="listing-badge-container">
                            <span className={`badge ${list.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                              {list.status}
                            </span>
                            <span className={`badge ${list.riskLevel === 'low' ? 'badge-success' : 'badge-warning'}`}>
                              Risk: {list.riskLevel} ({list.riskScore})
                            </span>
                          </div>
                        </div>
                        <div className="listing-details">
                          <div className="listing-meta-row">
                            <span>Quantity: {list.quantity}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icons.Clock /> {getCountdown(list.expiryTime)}
                            </span>
                          </div>
                          <h4 className="listing-title">{list.title}</h4>
                          <p className="listing-desc">{list.description}</p>
                          <div className="listing-footer">
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code: {list.pickupCode}</span>
                            {list.status === 'claimed' && (
                              <span className="badge badge-info">Claimed by NGO</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {listings.filter(l => l.donorId === user.id).length === 0 && (
                      <div className="card" style={{ gridColumn: 'span 3', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No food listings published yet. Fill out the form above to share your first meal!
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* B. INSTITUTION DONOR DASHBOARD */}
            {user.role === 'institution' && (
              <div className="grid-cols-3">
                
                {/* Left Columns: Bulk Post and CSR metrics */}
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Bulk Posting */}
                  <div className="card glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icons.Plus /> Bulk Surplus Donation Portal (B2B SaaS)
                      </h3>
                      <span className="badge badge-info">Premium Outlet badge</span>
                    </div>

                    <form onSubmit={handlePostListing}>
                      <div className="grid-cols-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="inst-title">Surplus Item Category/Title</label>
                          <input type="text" id="inst-title" className="form-input" placeholder="e.g. Bulk Rice & Dal Catering Pack" value={newListingTitle} onChange={e => setNewListingTitle(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="inst-qty">Portions (Bulk Quantity)</label>
                          <input type="text" id="inst-qty" className="form-input" placeholder="e.g. 50 meals / 15 kg" value={newListingQty} onChange={e => setNewListingQty(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid-cols-3">
                        <div className="form-group">
                          <label className="form-label" htmlFor="inst-prep">Cooked/Prepared At</label>
                          <input type="datetime-local" id="inst-prep" className="form-input" value={newListingPrep} onChange={e => setNewListingPrep(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="inst-exp">Est. Expiry</label>
                          <input type="datetime-local" id="inst-exp" className="form-input" value={newListingExp} onChange={e => setNewListingExp(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="inst-window">Pickup Window</label>
                          <input type="text" id="inst-window" className="form-input" placeholder="e.g. 15:00 - 17:00" value={newListingTimeWindow} onChange={e => setNewListingTimeWindow(e.target.value)} />
                        </div>
                      </div>

                      {/* Safety Rules configuration */}
                      <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                          <label className="form-label" htmlFor="inst-cat">Food Category</label>
                          <select className="form-input" id="inst-cat" value={foodCategory} onChange={e => setFoodCategory(e.target.value)}>
                            <option value="cooked">Cooked Gravy/Rice</option>
                            <option value="dry">Dry snacks/Bakery</option>
                            <option value="liquid">Dairy/Soups</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label" htmlFor="inst-temp">Ambient Temperature</label>
                          <input type="number" id="inst-temp" className="form-input" value={weatherTemp} onChange={e => setWeatherTemp(e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label" htmlFor="inst-pack">Container Packaging</label>
                          <select className="form-input" id="inst-pack" value={packagingType} onChange={e => setPackagingType(e.target.value)}>
                            <option value="sealed">Sealed Foil Trays</option>
                            <option value="closed">Closed food tubs</option>
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-secondary pulse-button" style={{ width: '100%' }}>
                        Publish Bulk Listing (Auto-Verified)
                      </button>
                    </form>
                  </div>

                  {/* Impact Statistics */}
                  <div className="card glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h3>ESG & CSR Environmental Performance Report</h3>
                      <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={() => setShowCertificate(true)}>
                        <Icons.Award /> View Sustainability Certificate
                      </button>
                    </div>

                    <div className="grid-cols-3" style={{ marginBottom: '20px' }}>
                      <div className="stat-card" style={{ padding: '16px' }}>
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
                          <Icons.Leaf />
                        </div>
                        <div className="stat-info">
                          <h3>120 kg</h3>
                          <p>CO₂ Carbon Offset</p>
                        </div>
                      </div>

                      <div className="stat-card" style={{ padding: '16px' }}>
                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>
                          <Icons.Water />
                        </div>
                        <div className="stat-info">
                          <h3>48k Liters</h3>
                          <p>Water Saved</p>
                        </div>
                      </div>

                      <div className="stat-card" style={{ padding: '16px' }}>
                        <div className="stat-icon">
                          <Icons.Food />
                        </div>
                        <div className="stat-info">
                          <h3>480 meals</h3>
                          <p>Total Meals Redirected</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Profile and CSR Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card glass-panel" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Partner ID: {user.id}</p>
                    
                    <div style={{ marginTop: '16px', display: 'inline-block' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                        ✓ ESG Gold Verified
                      </span>
                    </div>

                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'left', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tier status:</span>
                        <strong style={{ color: 'var(--primary)' }}>SaaS Tier 1</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Outlets Monitored:</span>
                        <strong>3 Outlets</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tax reduction report:</span>
                        <strong style={{ color: 'var(--secondary)' }}>Eligible (80G)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card glass-panel">
                    <h4>Active Waste-Free Streak</h4>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1' }}>
                        {user.streak}
                      </div>
                      <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Days of zero food waste
                      </p>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: '80%' }}></div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                      Keep listing surplus daily to reach Platinum Tier!
                    </p>
                  </div>
                </div>

                {/* Listings Row */}
                <div style={{ gridColumn: 'span 3' }}>
                  <h3 style={{ marginBottom: '16px' }}>Your Commercial Listings</h3>
                  <div className="listings-grid">
                    {listings.filter(l => l.donorId === user.id).map(list => (
                      <div className="listing-card" key={list.id}>
                        <div className="listing-img-container">
                          <img src={list.photo} alt={list.title} className="listing-img" />
                          <div className="listing-badge-container">
                            <span className={`badge ${list.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                              {list.status}
                            </span>
                            <span className="badge badge-info">
                              {list.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="listing-details">
                          <div className="listing-meta-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icons.Shield /> Risk: {list.riskLevel} ({list.riskScore})
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icons.Clock /> {getCountdown(list.expiryTime)}
                            </span>
                          </div>
                          <h4 className="listing-title">{list.title}</h4>
                          <p className="listing-desc">{list.description}</p>
                          
                          <div className="tag-list">
                            {list.dietaryTags.map(t => (
                              <span className="tag" key={t}>{t}</span>
                            ))}
                          </div>

                          <div className="listing-footer">
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code: {list.pickupCode}</span>
                            {list.status === 'claimed' && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <span className="badge badge-warning">Claimed</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Delivery: {list.deliveryStatus}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* C. RECIPIENT DASHBOARD */}
            {user.role === 'recipient' && (
              <div>
                
                {/* Dashboard Stats */}
                <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
                  <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <Icons.Award />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.4rem' }}>{user.tokens} Tokens</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Used to claim food listings</p>
                    </div>
                  </div>

                  <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', gridColumn: 'span 2' }}>
                    <div className="stat-icon" style={{ background: 'var(--secondary-light)', color: 'var(--success)' }}>
                      <Icons.Shield />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem' }}>Preventive Health Filters Active</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter listings by allergens & custom clinical needs to guarantee safety.</p>
                    </div>
                  </div>
                </div>

                {/* Browse Feed */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>Nearby Surplus Food Listings</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span className="badge badge-success">Location: Bangalore (5km radius)</span>
                  </div>
                </div>

                <div className="listings-grid">
                  {listings.filter(l => l.status === 'available').map(list => (
                    <div className="listing-card" key={list.id}>
                      <div className="listing-img-container">
                        <img src={list.photo} alt={list.title} className="listing-img" />
                        <div className="listing-badge-container">
                          <span className={`badge ${list.riskLevel === 'low' ? 'badge-success' : 'badge-warning'}`}>
                            Risk: {list.riskLevel}
                          </span>
                          <span className="badge badge-info">
                            {list.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="listing-details">
                        <div className="listing-meta-row">
                          <span style={{ color: 'var(--text-muted)' }}>Donor: {list.donorName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icons.Clock /> {getCountdown(list.expiryTime)}
                          </span>
                        </div>
                        <h4 className="listing-title">{list.title}</h4>
                        <p className="listing-desc">{list.description}</p>
                        
                        <div className="tag-list">
                          {list.dietaryTags.map(t => (
                            <span className="tag" key={t}>{t}</span>
                          ))}
                          {list.allergens.map(a => (
                            <span className="tag" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} key={a}>Contains: {a}</span>
                          ))}
                        </div>

                        {/* Safety Warning for medium risk */}
                        {list.riskLevel === 'medium' && (
                          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', gap: '6px', marginBottom: '16px', lineHeight: '1.3' }}>
                            <Icons.Info />
                            <span>Consume within 2 hours. Expiry timeline shortened for preventive safety check.</span>
                          </div>
                        )}

                        <div className="listing-footer" style={{ paddingHeight: '10px' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            onClick={() => setSelectedListing(list)}
                          >
                            Read Details
                          </button>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                              onClick={() => handleClaimListing(list.id, false)}
                            >
                              Self Pickup
                            </button>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                              onClick={() => handleClaimListing(list.id, true)}
                            >
                              Request Rider
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {listings.filter(l => l.status === 'available').length === 0 && (
                    <div className="card" style={{ gridColumn: 'span 3', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No active food listings available right now. Please check back later!
                    </div>
                  )}
                </div>

                {/* Claimed Tickets Row */}
                <h3 style={{ marginTop: '40px', marginBottom: '16px' }}>Your Active Claims & Pickup Codes</h3>
                <div className="listings-grid">
                  {listings.filter(l => l.claimedBy === user.id && l.status === 'claimed').map(list => (
                    <div className="card glass-panel" key={list.id}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Claim Ticket: {list.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantity: {list.quantity}</p>
                      
                      <div className="ticket-container">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Drop-off Verification Code</div>
                        <div className="ticket-code">{list.deliveryCode}</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          Provide this code to the delivery rider or donor once the food is handed over safely.
                        </p>
                      </div>

                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span>Rider Status: <strong>{list.deliveryStatus}</strong></span>
                        <span style={{ color: 'var(--primary)' }}>Donor Name revealed: Aarav Sharma</span>
                      </div>
                    </div>
                  ))}
                  {listings.filter(l => l.claimedBy === user.id && l.status === 'claimed').length === 0 && (
                    <div className="card" style={{ gridColumn: 'span 3', padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      No active claims. Claim a listing above to generate a ticket.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* D. DELIVERY PARTNER DASHBOARD */}
            {user.role === 'delivery' && (
              <div className="grid-cols-3">
                
                {/* Active Deliveries / Map simulation (Left) */}
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h3>Active Delivery Requests</h3>
                  <div className="grid-cols-1">
                    {deliveries.filter(d => d.status === 'accepted' && d.riderId === user.id).map(job => (
                      <div className="card glass-panel" key={job.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <span className="badge badge-warning" style={{ marginBottom: '8px' }}>In Transit</span>
                            <h4>Job Ref: {job.id}</h4>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>₹{job.pay}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payout for trip</span>
                          </div>
                        </div>

                        {/* Address flow */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ color: 'var(--primary)' }}>●</div>
                            <div>
                              <strong style={{ color: 'var(--text-secondary)' }}>Pickup from:</strong> {job.pickupAddress}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ color: 'var(--secondary)' }}>■</div>
                            <div>
                              <strong style={{ color: 'var(--text-secondary)' }}>Deliver to:</strong> {job.dropAddress}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Verification forms */}
                        <div className="grid-cols-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          {job.status === 'accepted' && (
                            <div>
                              <label className="form-label" htmlFor="pickup-code-input">Enter Donor Pickup Code</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                  type="text" 
                                  id="pickup-code-input"
                                  className="form-input" 
                                  placeholder="6-digit code" 
                                  value={pickupCodeInput}
                                  onChange={e => setPickupCodeInput(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={() => handleVerifyPickup(job.id)}>Verify</button>
                              </div>
                            </div>
                          )}

                          {job.status === 'picked_up' && (
                            <div style={{ gridColumn: 'span 2' }}>
                              <label className="form-label" htmlFor="delivery-code-input">Enter Recipient Drop-off Code</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                  type="text" 
                                  id="delivery-code-input"
                                  className="form-input" 
                                  placeholder="6-digit code" 
                                  value={deliveryCodeInput}
                                  onChange={e => setDeliveryCodeInput(e.target.value)}
                                />
                                <button className="btn btn-secondary pulse-button" onClick={() => handleVerifyDelivery(job.id)}>Confirm Drop</button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                    {deliveries.filter(d => d.status === 'accepted' && d.riderId === user.id).length === 0 && (
                      <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No active jobs currently in transit. Accept a job from the board on the right!
                      </div>
                    )}
                  </div>

                  {/* Open Job Board */}
                  <h3>Available Jobs Board</h3>
                  <div className="grid-cols-1">
                    {deliveries.filter(d => d.status === 'pending').map(job => (
                      <div className="card" key={job.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ fontSize: '1.1rem' }}>Trip Distance: {job.distance} km</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pickup: {job.pickupAddress.slice(0, 30)}...</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>₹{job.pay}</div>
                            <button className="btn btn-primary" onClick={() => handleAcceptJob(job.id)}>Accept Job</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {deliveries.filter(d => d.status === 'pending').length === 0 && (
                      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No open delivery requests at this moment.
                      </div>
                    )}
                  </div>
                </div>

                {/* Earnings & Leaderboard Column (Right) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card glass-panel" style={{ textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Icons.Rider />
                    </div>
                    <h3>Weekly Earnings</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0' }}>
                      ₹{deliveries.filter(d => d.status === 'completed' && d.riderId === user.id).reduce((acc, c) => acc + c.pay, 0)}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Settlement every Sunday morning</p>

                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'left', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Completed Trips:</span>
                        <strong>{deliveries.filter(d => d.status === 'completed' && d.riderId === user.id).length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>UPI Handle:</span>
                        <strong>{user.phone}@ybl</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* E. ADMINISTRATOR DASHBOARD */}
            {user.role === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Aggregated platform stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon"><Icons.Food /></div>
                    <div className="stat-info">
                      <h3>{impactData ? impactData.totalMealsSaved : 510}</h3>
                      <p>Meals Redirected</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--secondary)', background: 'var(--secondary-light)' }}><Icons.Leaf /></div>
                    <div className="stat-info">
                      <h3>{impactData ? impactData.totalCarbonSavedKg : 130} kg</h3>
                      <p>Carbon Offset</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--info)', background: 'rgba(59,130,246,0.1)' }}><Icons.Water /></div>
                    <div className="stat-info">
                      <h3>{impactData ? impactData.totalWaterSavedLiters : 52000}L</h3>
                      <p>Water Recycled</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.1)' }}><Icons.User /></div>
                    <div className="stat-info">
                      <h3>{impactData ? Object.values(impactData.stats).reduce((a,b)=>a+b, 0) : 12}</h3>
                      <p>Active Platform Users</p>
                    </div>
                  </div>
                </div>

                <div className="grid-cols-2">
                  
                  {/* Public health alerts */}
                  <div className="card glass-panel">
                    <h3>Community Health Alert Signals</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                      Flagging geographical zones demanding high soft/easy-to-digest food (preventive pattern warning).
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {alerts.map(al => (
                        <div key={al.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="badge badge-danger">{al.area}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Realtime tracking active</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '12px' }}>{al.reason}</p>
                          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleResolveAlert(al.id)}>
                            Dismiss / Dispatch Outreach Teams
                          </button>
                        </div>
                      ))}
                      {alerts.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          No health alerts registered. Area indexes normal.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campus sustainability mode */}
                  <div className="card glass-panel">
                    <h3>Campus & Hostel Sustainability Mode</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                      Hostel food waste analysis and nutrition deficits among campus residents.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}>
                        <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '8px', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Hostel A Waste Index</span>
                          <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '700' }}>32% High</span>
                        </div>
                        <div className="progress-container">
                          <div className="progress-bar" style={{ width: '32%', background: 'var(--danger)' }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                          Target skip-meals warning threshold: &gt; 15% skip pattern.
                        </p>
                      </div>

                      <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}>
                        <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '8px', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Student Nutrition Deficit Gaps (Iron / Protein)</span>
                          <span style={{ color: 'var(--warning)', fontSize: '0.85rem', fontWeight: '700' }}>Low Iron Detected</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>
                          Hostel residents skipped meals frequency: <strong>4.2 per week</strong>. Suggesting protein-rich breakfast redistribution.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Audit Listing board */}
                <div className="card glass-panel">
                  <h3>Global Food Listings Audit</h3>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Listing Name</th>
                          <th>Donor</th>
                          <th>Risk Score</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Handover</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map(l => (
                          <tr key={l.id}>
                            <td><strong>{l.title}</strong></td>
                            <td>{l.donorName}</td>
                            <td>
                              <span className={`badge ${l.riskLevel === 'low' ? 'badge-success' : 'badge-warning'}`}>
                                {l.riskScore} ({l.riskLevel})
                              </span>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{l.dietaryTags.join(', ') || 'Standard cooked'}</td>
                            <td><span className={`badge ${l.status === 'available' ? 'badge-success' : 'badge-warning'}`}>{l.status}</span></td>
                            <td>
                              <span style={{ fontSize: '0.8rem' }}>Pickup: <code>{l.pickupCode}</code> | Drop: <code>{l.deliveryCode}</code></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 ShareBite Inc. Dignity-First Harm Reduction & Food Safety Logistics Platform.</p>
      </footer>

      {/* 3. MODAL POPUPS */}
      
      {/* Detail Listing Modal */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{selectedListing.title}</h3>
            
            <img src={selectedListing.photo} alt={selectedListing.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />

            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {selectedListing.description}
            </p>

            <div className="risk-indicator">
              <div className={`risk-circle ${selectedListing.riskLevel}`}>
                {selectedListing.riskScore}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                  Safety Risk Index: {selectedListing.riskLevel.toUpperCase()}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {selectedListing.riskLevel === 'low' 
                    ? 'Excellent condition. Fully approved for general redistribution.' 
                    : 'Elevated risk. Expiry window restricted. Consume immediately.'
                  }
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              <div>📦 <strong>Quantity:</strong> {selectedListing.quantity}</div>
              <div>⏰ <strong>Expiry window:</strong> {getCountdown(selectedListing.expiryTime)}</div>
              <div>⚠️ <strong>Allergens:</strong> {selectedListing.allergens.join(', ') || 'None declared'}</div>
              <div>🏷️ <strong>Nutrition tags:</strong> {selectedListing.dietaryTags.join(', ') || 'None'}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedListing(null)}>Close</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                onClick={() => {
                  handleClaimListing(selectedListing.id, true);
                  setSelectedListing(null);
                }}
              >
                Claim & Request Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESG Certificate Modal */}
      {showCertificate && (
        <div className="modal-overlay" onClick={() => setShowCertificate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '40px', textAlign: 'center', background: '#0e101a', border: '3px double rgba(16, 185, 129, 0.4)' }}>
            <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <Icons.Award />
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.8rem', letterSpacing: '0.05em', marginBottom: '8px' }}>
              WASTE REDUCTION EXCELLENCE
            </h2>
            <h4 style={{ color: 'var(--text-secondary)', fontWeight: '400', letterSpacing: '0.1em', fontSize: '0.9rem', marginBottom: '32px' }}>
              CORPORATE SUSTAINABILITY CERTIFICATE
            </h4>

            <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              This is to verify that
            </p>
            <h3 style={{ fontSize: '2rem', color: '#ffffff', fontWeight: '800', marginBottom: '24px' }}>
              {user.name}
            </h3>
            
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 32px' }}>
              has successfully diverted <strong>480 meals</strong> from landfills, offsetting approximately <strong>120.0 kg of CO₂ equivalent carbon emissions</strong> and saving <strong>48,000 Liters of fresh water</strong> through the ShareBite redistribution network.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>
                <div>Verified Audit ID:</div>
                <code>SB-ESG-94819</code>
              </div>
              <div>
                <div>Issued on:</div>
                <strong>July 18, 2026</strong>
              </div>
            </div>

            <button className="btn btn-secondary" style={{ marginTop: '32px', width: '100%' }} onClick={() => setShowCertificate(false)}>
              Print / Save PDF Report
            </button>
          </div>
        </div>
      )}

      {/* Claim Success Ticket QR Modal */}
      {showQRClaim && (
        <div className="modal-overlay" onClick={() => setShowQRClaim(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icons.Check />
            </div>
            
            <h3>Claimed Successfully!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your claim ticket has been generated. Keep this screen open for verification code entry.
            </p>

            <div className="ticket-container">
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                DROP-OFF HANDOVER VERIFICATION CODE
              </div>
              <div className="ticket-code">{showQRClaim.deliveryCode}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Present this to the rider upon drop-off. If picking up yourself, give this to the donor.
              </p>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>🏢 <strong>Donor Location:</strong> {showQRClaim.location.address}</div>
              <div>🔑 <strong>Donor Pickup Code:</strong> <code>{showQRClaim.pickupCode}</code> (Share with rider)</div>
              <div>👤 <strong>Donor Name revealed:</strong> Aarav Sharma</div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setShowQRClaim(null)}>
              Done (Go to active claims)
            </button>
          </div>
        </div>
      )}
      {/* Floating Virtual Phone Toggle Button */}
      <button className="virtual-phone-toggle" onClick={() => setShowVirtualPhone(!showVirtualPhone)}>
        <span>📱</span> {showVirtualPhone ? 'Close SMS Center' : 'Open SMS Center'}
      </button>

      {/* Simulated Smartphone Sidebar */}
      <div className={`virtual-phone-sidebar ${showVirtualPhone ? 'open' : ''}`}>
        <div className="phone-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>💬</span>
            <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Virtual SMS Center</strong>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
            onClick={() => setShowVirtualPhone(false)}
          >
            Hide
          </button>
        </div>

        <div className="phone-screen" data-lenis-prevent style={{ minHeight: 0 }}>
          <div className="phone-status-bar">
            <span>9:41 AM</span>
            <span>5G 📶 100% 🔋</span>
          </div>

          <div className="phone-action-hint">
            💡 <strong>Simulated Network Gateway</strong><br/>
            All OTP codes, rider verifications, and delivery handovers trigger SMS alerts in real-time here.
          </div>

          <div className="sms-thread-container">
            {smsLogs.map(sms => (
              <div className="sms-bubble" key={sms.id}>
                <div className="sms-sender-header">
                  <span style={{ color: 'var(--primary)' }}>{sms.from}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{sms.time}</span>
                </div>
                <div className="sms-body-text" style={{ color: '#ffffff' }}>
                  To <strong>{sms.to}</strong>:<br/>
                  {sms.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Floating Chatbot Toggle Button */}
      <button 
        className="virtual-phone-toggle" 
        style={{ bottom: '90px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)' }}
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <span>🤖</span> {showChatbot ? 'Close Assistant' : 'AI Assistant'}
      </button>

      {/* Simulated Chatbot Sidebar (Left-aligned) */}
      <div className={`chatbot-sidebar ${showChatbot ? 'open' : ''}`}>
        <div className="phone-header-bar" style={{ background: 'var(--bg-input)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🤖</span>
            <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>ShareBite Assistant</strong>
            <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>Online</span>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
            onClick={() => setShowChatbot(false)}
          >
            Hide
          </button>
        </div>

        <div className="phone-screen" data-lenis-prevent style={{ background: '#121216', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingBottom: '16px', minHeight: 0 }}>
            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`sms-bubble ${msg.sender === 'user' ? 'outgoing' : ''}`}
                style={
                  msg.sender === 'user' 
                    ? { alignSelf: 'flex-end', background: 'var(--primary)', color: '#131313' } 
                    : msg.guarded
                      ? { alignSelf: 'flex-start', background: 'rgba(255, 180, 171, 0.1)', borderColor: 'var(--danger)', color: 'var(--danger)' }
                      : { alignSelf: 'flex-start', background: 'var(--bg-card)', color: 'var(--text-primary)' }
                }
              >
                {msg.sender !== 'user' && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: msg.guarded ? 'var(--danger)' : 'var(--primary)', marginBottom: '4px' }}>
                    {msg.guarded ? '🚨 Guardrail System' : '🤖 ShareBite AI'}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="sms-bubble" style={{ alignSelf: 'flex-start', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assistant is typing...</div>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', marginBottom: '8px' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 10px', fontSize: '0.7rem', textTransform: 'none', borderRadius: '20px' }}
              onClick={(e) => handleSendChatMessage(e, 'How is the spoilage risk calculated?')}
            >
              📊 Spoilage calculation?
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 10px', fontSize: '0.7rem', textTransform: 'none', borderRadius: '20px' }}
              onClick={(e) => handleSendChatMessage(e, 'What are the rider pay rules?')}
            >
              🏍️ Rider earnings?
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 10px', fontSize: '0.7rem', textTransform: 'none', borderRadius: '20px' }}
              onClick={(e) => handleSendChatMessage(e, 'How does the NGO token system work?')}
            >
              🪙 NGO tokens?
            </button>
          </div>

          {/* Input form */}
          <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <input 
              type="text" 
              className="form-input" 
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem', borderRadius: '20px' }}
              placeholder="Ask rules or test swearing..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isChatSending}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '10px 18px', borderRadius: '20px' }}
              disabled={isChatSending}
            >
              Send
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
