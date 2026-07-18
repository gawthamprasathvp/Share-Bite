const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const db = require('./database');

// Twilio Client Helper utilizing Node native https (Zero external dependencies)
const sendTwilioSMS = (to, body) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
        console.log(`[Twilio Bypass] Credentials missing. Local simulate SMS to ${to}: ${body}`);
        return Promise.resolve({ success: false, reason: 'credentials_missing' });
    }

    return new Promise((resolve) => {
        const postData = querystring.stringify({
            To: to,
            From: fromPhone,
            Body: body
        });

        const auth = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

        const options = {
            hostname: 'api.twilio.com',
            port: 443,
            path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let resBody = '';
            res.on('data', (chunk) => { resBody += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, response: JSON.parse(resBody) });
                } else {
                    console.error('[Twilio API Error Response]', resBody);
                    resolve({ success: false, reason: 'twilio_error', statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (err) => {
            console.error('[Twilio Connection Error]', err);
            resolve({ success: false, reason: 'network_error', error: err.message });
        });

        req.write(postData);
        req.end();
    });
};

// Textbelt Free SMS Helper (Sends 1 free SMS per day per IP - No credentials required!)
const sendTextbeltSMS = (to, body) => {
    return new Promise((resolve) => {
        const postData = querystring.stringify({
            number: to,
            message: body,
            key: 'textbelt'
        });

        const options = {
            hostname: 'textbelt.com',
            port: 443,
            path: '/text',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let resBody = '';
            res.on('data', (chunk) => { resBody += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(resBody);
                    if (parsed.success) {
                        resolve({ success: true, response: parsed });
                    } else {
                        console.error('[Textbelt Free SMS Error]', parsed.error || resBody);
                        resolve({ success: false, reason: parsed.error || 'limit_reached' });
                    }
                } catch (e) {
                    resolve({ success: false, reason: 'parse_error' });
                }
            });
        });

        req.on('error', (err) => {
            console.error('[Textbelt Free SMS Connection Error]', err);
            resolve({ success: false, reason: 'network_error', error: err.message });
        });

        req.write(postData);
        req.end();
    });
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to calculate risk score
const calculateRiskScore = (prepTime, category, weatherTemp, packaging) => {
    let score = 0;
    
    // Time factor (hours since preparation)
    const hoursSincePrep = (new Date() - new Date(prepTime)) / (1000 * 60 * 60);
    score += Math.min(hoursSincePrep * 8, 40); // Max 40 points from time
    
    // Temperature factor
    const temp = parseFloat(weatherTemp) || 25;
    if (temp > 35) {
        score += 25;
    } else if (temp > 30) {
        score += 15;
    } else if (temp > 25) {
        score += 5;
    }
    
    // Category factor
    if (category === 'liquid') {
        score += 20;
    } else if (category === 'cooked') {
        score += 12;
    } else if (category === 'dry') {
        score += 3;
    }
    
    // Packaging factor
    if (packaging === 'open') {
        score += 25;
    } else if (packaging === 'closed') {
        score += 10;
    } else if (packaging === 'sealed') {
        score += 0;
    }
    
    // Round and clamp to 0-100
    score = Math.min(Math.max(Math.round(score), 0), 100);
    
    let level = 'low';
    if (score >= 70) {
        level = 'high';
    } else if (score >= 40) {
        level = 'medium';
    }
    
    return { score, level };
};

// Initialize Mock Data if empty
const initializeMockData = () => {
    const existingUsers = db.find('users');
    if (existingUsers.length === 0) {
        console.log('Initializing mock users...');
        // Create standard roles
        db.insert('users', { id: 'donor1', phone: '9876543210', role: 'donor', name: 'Aarav Sharma', score: 120, streak: 3 });
        db.insert('users', { 
            id: 'inst1', 
            phone: '8765432109', 
            role: 'institution', 
            name: 'Grand Pavilion Restaurant', 
            score: 450, 
            streak: 12,
            details: {
                address: '12, MG Road, Bangalore',
                outletCount: 3,
                tier: 'Gold Partner'
            },
            verified: true
        });
        db.insert('users', { id: 'recipient1', phone: '7654321098', role: 'recipient', name: 'Community Care NGO', tokens: 8 });
        db.insert('users', { id: 'recipient2', phone: '7654321099', role: 'recipient', name: 'Raju (Feature Phone User)', tokens: 3 });
        db.insert('users', { id: 'delivery1', phone: '6543210987', role: 'delivery', name: 'Karthik Kumar', verified: true, score: 95 });
        db.insert('users', { id: 'admin1', phone: '9999999999', role: 'admin', name: 'System Admin' });
    }

    const existingListings = db.find('listings');
    if (existingListings.length === 0) {
        console.log('Initializing mock listings...');
        
        // Listing 1: Available Low Risk Listing
        const prep1 = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
        const exp1 = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours from now
        const risk1 = calculateRiskScore(prep1, 'dry', 28, 'sealed');
        db.insert('listings', {
            id: 'list1',
            donorId: 'inst1',
            donorName: 'Grand Pavilion Restaurant',
            title: 'Freshly Baked Roti & Paneer Curry',
            description: '15 portions of Paneer Butter Masala with Butter Rotis. Packed separately in food-grade containers.',
            quantity: '15 portions',
            prepTime: prep1,
            expiryTime: exp1,
            pickupWindow: '22:00 - 23:30',
            allergens: ['dairy', 'gluten'],
            dietaryTags: ['veg', 'high protein'],
            status: 'available',
            claimedBy: null,
            deliveryPartnerId: null,
            deliveryStatus: 'none',
            location: { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore' },
            riskScore: risk1.score,
            riskLevel: risk1.level,
            pickupCode: '102938',
            deliveryCode: '582910',
            photo: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600'
        });

        // Listing 2: Available Medium Risk Listing
        const prep2 = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(); // 4 hours ago
        const exp2 = new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(); // 1.5 hours from now
        const risk2 = calculateRiskScore(prep2, 'cooked', 33, 'closed');
        db.insert('listings', {
            id: 'list2',
            donorId: 'donor1',
            donorName: 'Aarav Sharma',
            title: 'Homemade Vegetable Khichdi',
            description: 'Delicious hot khichdi made at home. Suitable for 3-4 people. Please bring your own container if possible.',
            quantity: '4 portions',
            prepTime: prep2,
            expiryTime: exp2,
            pickupWindow: '21:30 - 23:00',
            allergens: [],
            dietaryTags: ['veg', 'low sugar', 'diabetic safe'],
            status: 'available',
            claimedBy: null,
            deliveryPartnerId: null,
            deliveryStatus: 'none',
            location: { latitude: 12.9806, longitude: 77.6000, address: 'Indiranagar, Bangalore' },
            riskScore: risk2.score,
            riskLevel: risk2.level,
            pickupCode: '748291',
            deliveryCode: '918273',
            photo: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600'
        });

        // Listing 3: Claimed & In-transit Listing
        const prep3 = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        const exp3 = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        const risk3 = calculateRiskScore(prep3, 'cooked', 27, 'sealed');
        db.insert('listings', {
            id: 'list3',
            donorId: 'inst1',
            donorName: 'Grand Pavilion Restaurant',
            title: 'Vegetable Biryani Bulk Pack',
            description: 'Large tray of aromatic veg biryani. Serves around 25 people. Ideal for shelter home distribution.',
            quantity: '25 portions',
            prepTime: prep3,
            expiryTime: exp3,
            pickupWindow: '19:00 - 21:00',
            allergens: [],
            dietaryTags: ['veg', 'high calorie'],
            status: 'claimed',
            claimedBy: 'recipient1',
            deliveryPartnerId: 'delivery1',
            deliveryStatus: 'assigned',
            location: { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore' },
            riskScore: risk3.score,
            riskLevel: risk3.level,
            pickupCode: '439201',
            deliveryCode: '887612',
            photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600'
        });
        
        // Listing 4: Completed delivery listing for history & CSR reports
        const prep4 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const exp4 = new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString();
        const risk4 = calculateRiskScore(prep4, 'cooked', 25, 'sealed');
        db.insert('listings', {
            id: 'list4',
            donorId: 'inst1',
            donorName: 'Grand Pavilion Restaurant',
            title: 'Lentil Soup (Dal Tadka) & Rice',
            description: 'Simple nutritious dal and rice. 30 packs.',
            quantity: '30 portions',
            prepTime: prep4,
            expiryTime: exp4,
            pickupWindow: '12:00 - 14:00',
            allergens: [],
            dietaryTags: ['veg', 'diabetic safe', 'low sugar'],
            status: 'delivered',
            claimedBy: 'recipient1',
            deliveryPartnerId: 'delivery1',
            deliveryStatus: 'delivered',
            location: { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore' },
            riskScore: risk4.score,
            riskLevel: risk4.level,
            pickupCode: '228394',
            deliveryCode: '773829',
            photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'
        });

        // Insert into deliveries mapping
        db.insert('deliveries', {
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
        });

        // Insert completed delivery
        db.insert('deliveries', {
            id: 'del2',
            listingId: 'list4',
            riderId: 'delivery1',
            status: 'completed',
            pay: 85,
            pickupAddress: 'Grand Pavilion Restaurant, MG Road, Bangalore',
            dropAddress: 'Community Care NGO Center, Bangalore',
            pickupCode: '228394',
            deliveryCode: '773829',
            distance: 4.8,
            urgency: 'low'
        });

        // Insert impact logs
        db.insert('impacts', {
            id: 'imp1',
            donorId: 'inst1',
            listingId: 'list4',
            mealsSaved: 30,
            carbonSaved: 75.0, // 30 * 2.5
            waterSaved: 30000,  // 30 * 1000
            recipientId: 'recipient1',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        });
        
        db.insert('impacts', {
            id: 'imp2',
            donorId: 'donor1',
            listingId: 'list_prev1',
            mealsSaved: 4,
            carbonSaved: 10.0,
            waterSaved: 4000,
            recipientId: 'recipient2',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        });
    }
    
    // Initialize Health alerts if empty
    const existingAlerts = db.find('alerts');
    if (existingAlerts.length === 0) {
        db.insert('alerts', {
            id: 'alert1',
            area: 'Bangalore East',
            flagged: true,
            reason: 'High demand for liquid/soft food registered in this zone. (Possible public recovery zone)',
            createdAt: new Date().toISOString()
        });
    }
};

// Execute Initialization
initializeMockData();

// --- API ROUTES ---

// 1. Authentication / OTP Simulator
// 1. Authentication / OTP Controller
app.post('/api/auth/send-otp', async (req, res) => {
    const { phone, role } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Clean up previous OTPs for this number
    db.delete('otps', { phone });

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    // Store in DB
    db.insert('otps', { phone, code, expiresAt });

    const messageBody = `Your ShareBite verification code is: ${code}. Valid for 5 minutes.`;
    
    try {
        let sent = false;
        let provider = 'none';

        // 1. Try Twilio SMS
        const twilioResult = await sendTwilioSMS(phone, messageBody);
        if (twilioResult.success) {
            sent = true;
            provider = 'twilio';
        }

        // 2. Try Textbelt Free Gateway (1 SMS/day per IP - zero setup)
        if (!sent) {
            console.log('[Auth] Twilio credentials missing or delivery failed. Trying free Textbelt SMS gateway...');
            const textbeltResult = await sendTextbeltSMS(phone, messageBody);
            if (textbeltResult.success) {
                sent = true;
                provider = 'textbelt';
            }
        }

        if (sent) {
            return res.json({ 
                message: `OTP sent successfully to your phone via ${provider}.`, 
                phone, 
                role,
                code,
                demo: false 
            });
        } else {
            // Fallback to Interactive Demo Mode
            return res.json({ 
                message: '[Demo Mode] Free SMS limit reached or gateways offline. Use the displayed code to verify.', 
                phone, 
                role,
                code: code,
                demo: true 
            });
        }
    } catch (err) {
        console.error('[SMS Dispatch Error]', err);
        return res.status(500).json({ error: 'Internal server error processing SMS dispatch.' });
    }
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp, role, name } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required.' });
    }

    let isValid = false;

    // Check in database for active OTP
    const activeOtp = db.findOne('otps', { phone });
    if (activeOtp) {
        const isMatch = activeOtp.code === otp;
        const isNotExpired = new Date(activeOtp.expiresAt) > new Date();

        if (isMatch && isNotExpired) {
            isValid = true;
            db.delete('otps', { phone }); // Burn code after use
        } else if (isMatch && !isNotExpired) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }
    }

    // Fallback master override for local sandbox if credentials are not configured
    const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    if (!isValid && otp === '123456' && !twilioConfigured) {
        isValid = true;
    }

    if (!isValid) {
        return res.status(400).json({ error: 'Invalid OTP code. Please try again.' });
    }

    // Find or create user
    let user = db.findOne('users', { phone });
    if (!user) {
        user = db.insert('users', {
            phone,
            role: role || 'recipient',
            name: name || `User ${phone.slice(-4)}`,
            tokens: (role === 'recipient') ? 5 : 0,
            score: 0,
            streak: 0,
            verified: (role === 'institution' || role === 'delivery') ? false : true
        });
    }

    return res.json({ message: 'Login successful', user });
});

// Get user profile
app.get('/api/users/:id', (req, res) => {
    const user = db.findOne('users', { id: req.params.id });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
});

// 2. Listings
app.get('/api/listings', (req, res) => {
    const listings = db.find('listings');
    
    // Simple filter out expired active items (for testing simulation)
    const activeListings = listings.map(list => {
        if (list.status === 'available' && new Date(list.expiryTime) < new Date()) {
            db.update('listings', { id: list.id }, { status: 'expired' });
            return { ...list, status: 'expired' };
        }
        return list;
    });

    return res.json(activeListings);
});

// Create Food Listing
app.post('/api/listings', (req, res) => {
    const { donorId, title, description, quantity, prepTime, expiryTime, pickupWindow, allergens, dietaryTags, location, photo, category, weatherTemp, packaging } = req.body;
    
    if (!donorId || !title || !quantity || !prepTime || !expiryTime || !location) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }
    
    const donor = db.findOne('users', { id: donorId });
    if (!donor) {
        return res.status(404).json({ error: 'Donor not found.' });
    }
    
    // Safety calculations
    const risk = calculateRiskScore(prepTime, category || 'cooked', weatherTemp || 28, packaging || 'closed');
    
    if (risk.level === 'high') {
        return res.status(400).json({ 
            error: 'Food listing blocked due to high health safety risk.',
            riskScore: risk.score,
            riskLevel: risk.level,
            details: 'The combinations of preparation time, storage, temperature, and packaging indicate high risk of spoilage.' 
        });
    }
    
    // Generate codes
    const pickupCode = Math.floor(100000 + Math.random() * 90000).toString();
    const deliveryCode = Math.floor(100000 + Math.random() * 90000).toString();
    
    const newListing = db.insert('listings', {
        donorId,
        donorName: donor.name,
        title,
        description,
        quantity,
        prepTime,
        expiryTime: (risk.level === 'medium') ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : expiryTime, // Shorten expiry if medium risk
        pickupWindow,
        allergens: allergens || [],
        dietaryTags: dietaryTags || [],
        status: 'available',
        claimedBy: null,
        deliveryPartnerId: null,
        deliveryStatus: 'none',
        location,
        riskScore: risk.score,
        riskLevel: risk.level,
        pickupCode,
        deliveryCode,
        photo: photo || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600'
    });
    
    // Reward donor with score / streak increment
    const newScore = (donor.score || 0) + 15;
    const newStreak = (donor.streak || 0) + 1;
    db.update('users', { id: donorId }, { score: newScore, streak: newStreak });
    
    return res.status(201).json({ 
        message: 'Listing posted successfully!', 
        listing: newListing,
        riskAlert: risk.level === 'medium' ? 'Safety alert: Elevated risk. Listing expiry set to 2 hours for harm reduction.' : null
    });
});

// Claim Food Listing
app.post('/api/listings/:id/claim', (req, res) => {
    const { id } = req.params;
    const { recipientId, requestDelivery } = req.body;
    
    if (!recipientId) {
        return res.status(400).json({ error: 'Recipient ID is required.' });
    }
    
    const recipient = db.findOne('users', { id: recipientId });
    if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found.' });
    }
    
    // For recipients, verify tokens
    if (recipient.role === 'recipient' && recipient.tokens <= 0) {
        return res.status(400).json({ error: 'Insufficient tokens. Claiming food requires 1 token.' });
    }
    
    const listing = db.findOne('listings', { id });
    if (!listing) {
        return res.status(404).json({ error: 'Food listing not found.' });
    }
    
    if (listing.status !== 'available') {
        return res.status(400).json({ error: `Listing is already ${listing.status}.` });
    }
    
    // Deduct 1 token from recipient
    if (recipient.role === 'recipient') {
        db.update('users', { id: recipientId }, { tokens: recipient.tokens - 1 });
    }
    
    // Generate Delivery request if requested
    let deliveryStatus = 'none';
    let deliveryPartnerId = null;
    
    if (requestDelivery) {
        deliveryStatus = 'pending';
        // Insert a new delivery task
        const deliveryJob = db.insert('deliveries', {
            listingId: listing.id,
            riderId: null,
            status: 'pending',
            pay: Math.round(40 + Math.random() * 30), // ₹40-₹70 pay
            pickupAddress: listing.location.address,
            dropAddress: recipient.details?.address || 'Community Drop Location (Simulated)',
            pickupCode: listing.pickupCode,
            deliveryCode: listing.deliveryCode,
            distance: parseFloat((1 + Math.random() * 4).toFixed(1)),
            urgency: listing.riskLevel === 'medium' ? 'high' : 'medium'
        });
        
        console.log(`[System] Created delivery task: ${deliveryJob.id}`);
    }
    
    // Update listing status
    db.update('listings', { id }, { 
        status: 'claimed', 
        claimedBy: recipientId,
        deliveryStatus,
        deliveryPartnerId
    });
    
    // Log community trend (Hygiene/Soft food pattern check)
    // If a recipient claims soft/liquid foods multiple times, it contributes to area health pattern
    if (listing.dietaryTags.includes('liquid') || listing.dietaryTags.includes('diabetic safe')) {
        const area = listing.location.address.split(',').pop().trim();
        const areaAlerts = db.find('alerts', { area });
        if (areaAlerts.length === 0) {
            db.insert('alerts', {
                area,
                flagged: true,
                reason: `Higher claiming of easy-to-digest/low-sugar foods detected in ${area}. Notify outreach partners.`,
                createdAt: new Date().toISOString()
            });
        }
    }
    
    const updatedListing = db.findOne('listings', { id });
    return res.json({ 
        message: 'Food claimed successfully!', 
        listing: updatedListing,
        tokensRemaining: recipient.role === 'recipient' ? recipient.tokens - 1 : null
    });
});

// 3. Deliveries API
app.get('/api/deliveries', (req, res) => {
    const deliveries = db.find('deliveries');
    return res.json(deliveries);
});

// Accept Delivery Job
app.post('/api/deliveries/:id/accept', (req, res) => {
    const { id } = req.params;
    const { riderId } = req.body;
    
    if (!riderId) {
        return res.status(400).json({ error: 'Rider ID is required.' });
    }
    
    const delivery = db.findOne('deliveries', { id });
    if (!delivery) {
        return res.status(404).json({ error: 'Delivery task not found.' });
    }
    
    if (delivery.status !== 'pending') {
        return res.status(400).json({ error: 'Job is already accepted or completed.' });
    }
    
    db.update('deliveries', { id }, { status: 'accepted', riderId });
    db.update('listings', { id: delivery.listingId }, { 
        deliveryPartnerId: riderId,
        deliveryStatus: 'assigned'
    });
    
    return res.json({ message: 'Delivery accepted successfully!', delivery: db.findOne('deliveries', { id }) });
});

// Pickup Verification
app.post('/api/deliveries/:id/pickup', (req, res) => {
    const { id } = req.params;
    const { code } = req.body;
    
    const delivery = db.findOne('deliveries', { id });
    if (!delivery) {
        return res.status(404).json({ error: 'Delivery task not found.' });
    }
    
    if (delivery.pickupCode !== code) {
        return res.status(400).json({ error: 'Invalid pickup code. Check with donor.' });
    }
    
    db.update('deliveries', { id }, { status: 'picked_up' });
    db.update('listings', { id: delivery.listingId }, { deliveryStatus: 'picked_up' });
    
    return res.json({ message: 'Pickup verified! Food is now in transit.', delivery: db.findOne('deliveries', { id }) });
});

// Delivery Completion / Handover Verification
app.post('/api/deliveries/:id/complete', (req, res) => {
    const { id } = req.params;
    const { code } = req.body;
    
    const delivery = db.findOne('deliveries', { id });
    if (!delivery) {
        return res.status(404).json({ error: 'Delivery task not found.' });
    }
    
    if (delivery.deliveryCode !== code) {
        return res.status(400).json({ error: 'Invalid drop-off code. Check with recipient.' });
    }
    
    db.update('deliveries', { id }, { status: 'completed' });
    
    // Complete food listing
    const listing = db.findOne('listings', { id: delivery.listingId });
    db.update('listings', { id: delivery.listingId }, { status: 'delivered', deliveryStatus: 'delivered' });
    
    // Add to impact metrics
    const portions = parseInt(listing.quantity) || 5;
    db.insert('impacts', {
        donorId: listing.donorId,
        listingId: listing.id,
        mealsSaved: portions,
        carbonSaved: parseFloat((portions * 2.5).toFixed(1)),
        waterSaved: portions * 1000,
        recipientId: listing.claimedBy
    });
    
    // Pay the rider
    const rider = db.findOne('users', { id: delivery.riderId });
    if (rider) {
        db.update('users', { id: delivery.riderId }, { score: (rider.score || 0) + 10 });
    }
    
    return res.json({ message: 'Delivery completed successfully! Handover verified.', delivery: db.findOne('deliveries', { id }) });
});

// 4. Impact Metrics
app.get('/api/impact', (req, res) => {
    const impacts = db.find('impacts');
    const users = db.find('users');
    
    const totalMeals = impacts.reduce((acc, curr) => acc + (curr.mealsSaved || 0), 0);
    const totalCarbon = impacts.reduce((acc, curr) => acc + (curr.carbonSaved || 0), 0);
    const totalWater = impacts.reduce((acc, curr) => acc + (curr.waterSaved || 0), 0);
    
    const institutionsCount = users.filter(u => u.role === 'institution').length;
    const individualDonorsCount = users.filter(u => u.role === 'donor').length;
    const recipientsCount = users.filter(u => u.role === 'recipient').length;
    const deliveryCount = users.filter(u => u.role === 'delivery').length;
    
    return res.json({
        totalMealsSaved: totalMeals,
        totalCarbonSavedKg: parseFloat(totalCarbon.toFixed(1)),
        totalWaterSavedLiters: totalWater,
        stats: {
            institutions: institutionsCount,
            individuals: individualDonorsCount,
            recipients: recipientsCount,
            riders: deliveryCount
        }
    });
});

// CSR Report for specific institution
app.get('/api/impact/csr/:donorId', (req, res) => {
    const { donorId } = req.params;
    const impacts = db.find('impacts', { donorId });
    
    const totalMeals = impacts.reduce((acc, curr) => acc + (curr.mealsSaved || 0), 0);
    const totalCarbon = impacts.reduce((acc, curr) => acc + (curr.carbonSaved || 0), 0);
    const totalWater = impacts.reduce((acc, curr) => acc + (curr.waterSaved || 0), 0);
    
    const user = db.findOne('users', { id: donorId });
    
    return res.json({
        institutionName: user ? user.name : 'Unknown Partner',
        tier: user?.details?.tier || 'Silver Partner',
        totalMealsSaved: totalMeals,
        totalCarbonSavedKg: parseFloat(totalCarbon.toFixed(1)),
        totalWaterSavedLiters: totalWater,
        history: impacts
    });
});

// 5. Health alerts
app.get('/api/health/alerts', (req, res) => {
    const alerts = db.find('alerts');
    return res.json(alerts);
});

// Admin command: dismiss or trigger custom community outreach
app.post('/api/health/alerts/:id/resolve', (req, res) => {
    db.delete('alerts', { id: req.params.id });
    return res.json({ message: 'Health alert marked as resolved.' });
});

// Toxic words list for abusive/harsh language filter
const toxicWords = ['abuse', 'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'crap', 'stupid', 'idiot', 'dick', 'loser', 'hate', 'kill', 'shut up', 'damn'];

const checkGuardrails = (text) => {
    const lower = text.toLowerCase();
    return toxicWords.some(word => lower.includes(word));
};

// Platform Operating Guidelines & General Food Safety Domain Knowledge Base (RAG Source)
const knowledgeBase = [
    {
        keywords: ['spoilage', 'score', 'risk', 'formula', 'calculation', 'preventive', 'safety', 'gate'],
        title: 'Preventive Spoilage Risk Scoring Formula',
        content: 'The platform uses a Spoilage Risk Score (0-100) calculated as follows:\n- Base Score: 0\n- Prep Age: +8 points per hour since preparation (max 40)\n- Temperature: +5 for >25°C, +15 for >30°C, +25 for >35°C\n- Category: +3 for dry food, +12 for cooked hot food, +20 for liquid/dairy products\n- Packaging: +0 for sealed foil, +10 for closed lid container, +25 for open tray\n\nScoring actions:\n- <40: Low Risk (Auto-approved for delivery)\n- 40-69: Medium Risk (Approved with restricted 2-hour delivery window)\n- >=70: High Risk (Auto-blocked by safety gate)'
    },
    {
        keywords: ['individual', 'donor', 'claim', 'time limit', '2 hours', 'unclaimed', 'limit'],
        title: 'Individual Donor Pick-up Policy',
        content: 'For food donated by Individual Donors, the recipient NGO or rider must claim and pick up the listing within 2 hours of the post. If unclaimed, it is automatically flagged to prevent waste.'
    },
    {
        keywords: ['tokens', 'allocation', 'start', 'recipient', 'ngo', 'deduction', 'points'],
        title: 'Recipient NGO Token System',
        content: 'Each Recipient NGO starts with 5 tokens. Every time they claim a food listing, 1 token is deducted. They earn tokens back by successfully completing handovers or entering verification codes.'
    },
    {
        keywords: ['rider', 'courier', 'earnings', 'flat', 'incentive', 'pickup code', 'pay', 'payout'],
        title: 'Rider Partner Earnings and Workflow',
        content: 'Rider Partners earn pay per delivery (flat fee + distance-based incentives). To ensure safety and verification, the rider must obtain the pickup code from the donor to load the food, and enter the drop-off code from the recipient to finalize the payout.'
    },
    {
        keywords: ['esg', 'carbon', 'co2', 'water', 'environment', 'csr', 'saving'],
        title: 'Environmental ESG Carbon Reporting',
        content: 'Every redirect meal saves carbon and water:\n- 1 portions/meal redirected = 2.5 kg of CO₂ equivalent avoided.\n- 1 portions/meal redirected = 1000 Liters of fresh water conserved.\nThese metrics are aggregated for Corporate Social Responsibility (CSR) reports.'
    },
    {
        keywords: ['area', 'alert', 'health', 'trend', 'outreach', 'community'],
        title: 'Area Health Trend Alerting',
        content: 'Areas showing repeated food safety blocks or high waste volumes are flagged as High Alert Zones. System Administrators monitor these zones to initiate targeted community food outreach programs.'
    },
    {
        keywords: ['temperature', 'temp', 'cold', 'hot', 'freeze', 'frozen', 'danger zone', 'refrigerate', 'fridge'],
        title: 'Food Storage Temperature Standards',
        content: 'To prevent bacterial growth, follow these food safety temperature standards:\n- Hot Holding: Maintain food at 60°C (140°F) or above.\n- Cold Storage (Refrigeration): Store food at 4°C (40°F) or below.\n- Freezing: Maintain frozen food at -18°C (0°F) or below.\n- Danger Zone: Bacteria multiply rapidly between 4°C and 60°C (40°F - 140°F). High-risk food left in the Danger Zone for more than 2 hours must be discarded.'
    },
    {
        keywords: ['dairy', 'milk', 'cheese', 'yogurt', 'butter', 'liquid'],
        title: 'Dairy and Liquid Food Preservation',
        content: 'Dairy and liquid products are high-risk foods because they contain high moisture and protein, allowing bacteria to multiply rapidly.\n- Always transport dairy in insulated cold-bags at or below 4°C.\n- Inspect for swelling, sour smells, or separation before redistribution.\n- The Spoilage Gate automatically adds a +20 point risk modifier to liquid/dairy items.'
    },
    {
        keywords: ['meat', 'chicken', 'poultry', 'beef', 'fish', 'pork', 'cooked'],
        title: 'Meat and Poultry Safety Guidelines',
        content: 'Guidelines for meat and poultry redistribution:\n- Cooked Meats: Ensure they were cooked to a minimum internal temperature of 74°C (165°F).\n- Storage: Keep hot cooked meats above 60°C, or cool rapidly and store below 4°C.\n- Raw Meats: Keep strictly separated from cooked foods to prevent cross-contamination. Inspect packaging for leaks.'
    },
    {
        keywords: ['allergen', 'allergy', 'peanut', 'nut', 'gluten', 'wheat', 'dairy', 'soy', 'seafood', 'fish'],
        title: 'Food Allergen Management',
        content: 'ShareBite tracks major allergens to ensure recipient safety:\n- Critical Allergens: Peanuts, Tree Nuts, Milk, Eggs, Wheat (Gluten), Soy, Fish, Shellfish, and Sesame.\n- Cross-Contact: Prevent cross-contamination by using separate preparation areas, clean utensils, and sealed packaging.\n- Labeling: Donors must declare all allergens when posting food. Recipients can filter feed listings based on allergen alerts.'
    },
    {
        keywords: ['produce', 'fruit', 'vegetable', 'veg', 'fresh', 'raw', 'salad'],
        title: 'Fresh Produce Guidelines',
        content: 'Guidelines for fresh fruits and vegetables:\n- Visual Inspection: Inspect for mold, soft rot, bruising, or insect damage. Bruised portions can be cut, but moldy items must be discarded.\n- Washing: Advise recipients to wash all fresh produce under clean running water before raw consumption.\n- Storage: Store leafy greens and cut produce under refrigeration below 4°C.'
    },
    {
        keywords: ['shelf life', 'expire', 'expiry', 'date', 'best before', 'use by', 'spoiled'],
        title: 'Understanding Expiry and Best-Before Dates',
        content: 'Distinguishing between date labels:\n- "Use By" / "Expiry" Date: Safety-critical. Do not distribute or consume food past this date.\n- "Best Before" Date: Quality-oriented. Food is often safe to eat past this date if stored properly. Inspect for odors, textures, and appearance.\n- ShareBite Spoilage scoring calculates real-time freshness decay to ensure no food past safe bounds is listed.'
    },
    {
        keywords: ['vegetarian', 'vegan', 'halal', 'kosher', 'dietary', 'diet', 'pork'],
        title: 'Dietary Preference Standards',
        content: 'Ensuring respectful food allocation for diverse dietary preferences:\n- Vegetarian: Free from meat, poultry, fish, and by-products.\n- Vegan: Strictly plant-based (no meat, dairy, eggs, or honey).\n- Halal: Prepared according to Islamic law (no pork, alcohol, or non-halal meats).\n- Kosher: Prepared according to Jewish law (no pork, shellfish, or mixed meat/dairy).\nShareBite includes clear dietary filters to help NGOs select appropriate meals for their communities.'
    },
    {
        keywords: ['dignity', 'ethics', 'scraps', 'waste', 'quality', 'respect'],
        title: 'Dignity-First Food Quality Standards',
        content: 'Dignity is the core of ShareBite:\n- Never redistribute plate scraps, half-eaten meals, or food past its safe edible lifespan.\n- Only distribute surplus food that is wholesome, appetizing, and of a quality you would feed to your own family.\n- Recipient NGO feedback reports help monitor donor quality standards.'
    }
];

// RAG Chatbot Endpoint with Guardrails
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    // 1. Guardrails Check
    if (checkGuardrails(message)) {
        return res.json({
            reply: "⚠️ [Guardrail Warning] I apologize, but I am programmed to maintain a professional, respectful, and safe conversation. Please refrain from using harsh or abusive words. How can I help you with ShareBite's platform rules?",
            guarded: true
        });
    }

    // 2. RAG Pipeline - Keyword-based semantic search
    const lowerMsg = message.toLowerCase();
    let matches = [];
    
    for (const item of knowledgeBase) {
        let matchedCount = 0;
        for (const word of item.keywords) {
            if (lowerMsg.includes(word)) {
                matchedCount++;
            }
        }
        if (matchedCount > 0) {
            matches.push({ item, count: matchedCount });
        }
    }

    // Sort matches by number of matching keywords
    matches.sort((a, b) => b.count - a.count);

    // 3. Generate response
    if (matches.length > 0) {
        const bestMatch = matches[0].item;
        return res.json({
            reply: `🤖 **ShareBite Assistant** (Context: *${bestMatch.title}*):\n\n${bestMatch.content}\n\n*Reference: ShareBite Platform Guidelines.*`,
            source: bestMatch.title,
            guarded: false
        });
    } else {
        // Fallback general guidance
        return res.json({
            reply: "🤖 **ShareBite Assistant**:\nI couldn't find a specific rule matching your question. I am trained on ShareBite's operating guidelines, including:\n- Spoilage risk calculation\n- Recipient NGO token rules\n- Rider payout verification codes\n- Individual donor pick-up limits\n- ESG environmental carbon reports\n\nCould you please rephrase or ask about one of these topics?",
            guarded: false
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`[ShareBite Server] running on http://localhost:${PORT}`);
});
