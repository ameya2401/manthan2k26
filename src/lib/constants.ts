import { Event } from './types';

// Category styling maps
export const categoryColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    technical: {
        bg: 'bg-manthan-maroon/5',
        text: 'text-manthan-maroon',
        border: 'border-manthan-maroon/20',
        badge: 'bg-manthan-maroon/10 text-manthan-maroon',
    },
    cultural: {
        bg: 'bg-manthan-maroon/5',
        text: 'text-manthan-maroon',
        border: 'border-manthan-maroon/20',
        badge: 'bg-manthan-maroon/10 text-manthan-maroon',
    },
    sports: {
        bg: 'bg-manthan-maroon/5',
        text: 'text-manthan-maroon',
        border: 'border-manthan-maroon/20',
        badge: 'bg-manthan-maroon/10 text-manthan-maroon',
    },
};

export const categoryIcons: Record<string, string> = {
    technical: '💻',
    cultural: '🎭',
    sports: '⚽',
};

export const sportsCommitteeStructure = {
    outdoor: ['Vayu Krida (Badminton)', 'Kanduk Kshetra (Box Cricket)', 'Vayu Kanduk (Volleyball)', 'Rassa Yuddh (Tug of war)'],
    indoor: ['Chaturang (Chess)', 'Chakra Sangram (Carrom)', 'Chatur Yatra (Ludo)', 'Digital Yuddh (BGMI)', 'Bhu Utthaan (Deadlift)', 'Bahu Bal (Bench Press)'],
} as const;

const sportsTrackByName: Record<string, 'indoor' | 'outdoor'> = {
    'vayu krida (badminton)': 'outdoor',
    'kanduk kshetra (box cricket)': 'outdoor',
    'vayu kanduk (volleyball)': 'outdoor',
    'rassa yuddh (tug of war)': 'outdoor',
    'chaturang (chess)': 'indoor',
    'chakra sangram (carrom)': 'indoor',
    'chatur yatra (ludo)': 'indoor',
    'digital yuddh (bgmi)': 'indoor',
    'bhu utthaan (deadlift)': 'indoor',
    'bahu bal (bench press)': 'indoor',
    'e-sports': 'indoor',
    esports: 'indoor',
};

export function getSportsTrackByName(eventName: string): 'indoor' | 'outdoor' | null {
    const normalized = eventName.trim().toLowerCase();
    return sportsTrackByName[normalized] || null;
}

// Format fee from paise to INR display
export function formatFee(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

// Generate ticket ID
export function generateTicketId(category?: string): string {
    const prefix = 'MNT';
    const catCode = category ? category.substring(0, 4).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${catCode}-${timestamp}${random}`;
}

// Sanitize string input
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Format date
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    });
}

export function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    });
}

export function formatDateTime(dateStr: string): string {
    const date = formatDate(dateStr);
    // As per user request: "make it 9am to 5pm for every event"
    // We override logic to show the generalized slot
    return `${date} (09:00 AM - 05:00 PM)`;
}

// Calculate total fee server-side (this is the source of truth)
export function calculateTotalFee(events: Event[], selectedIds: string[]): number {
    return events
        .filter((e) => selectedIds.includes(e.id))
        .reduce((sum, e) => sum + e.fee, 0);
}

// Event schedule data
export const scheduleData = [
    {
        date: 'March 24, 2026 - Day 1',
        slots: [
            { time: '09:00 AM - 10:00 AM', event: 'Opening/Inauguration Ceremony', venue: 'HM Auditorium', category: 'cultural' },
            { time: '10:00 AM - 05:00 PM', event: 'VantraSutra (AI Website Building)', venue: 'Computer Lab 1', category: 'technical' },
            { time: '10:00 AM - 05:00 PM', event: 'Akshar Vedha (Typing Competition)', venue: 'Computer Lab 2', category: 'technical' },
            { time: '10:00 AM - 05:00 PM', event: 'Gyansabha (Quiz Competition)', venue: 'Computer Lab 2', category: 'technical' },
            { time: '10:00 AM - 05:00 PM', event: 'Rachnatmak Kala (Canva Poster Making)', venue: 'Computer Lab 1', category: 'technical' },
            { time: '10:00 AM - 05:00 PM', event: 'Vayu Krida (Badminton)', venue: 'Sports Court', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Kanduk Kshetra (Box Cricket)', venue: 'Cricket Ground', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Vayu Kanduk (Volleyball)', venue: 'Volleyball Court', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Rassa Yuddh (Tug of war)', venue: 'Main Ground', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Chaturang (Chess)', venue: 'Indoor Hall', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Chakra Sangram (Carrom)', venue: 'Indoor Hall', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Chatur Yatra (Ludo)', venue: 'Indoor Hall', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Digital Yuddh (BGMI)', venue: 'E-Sports Arena', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Bhu Utthaan (Deadlift)', venue: 'Fitness Arena', category: 'sports' },
            { time: '10:00 AM - 05:00 PM', event: 'Bahu Bal (Bench Press)', venue: 'Fitness Arena', category: 'sports' },
        ],
    },
    {
        date: 'March 25, 2026 - Day 2',
        slots: [
            { time: '09:00 AM - 01:00 PM', event: 'Ekal / Samuha Nritya (Dance)', venue: 'HM Auditorium', category: 'cultural' },
            { time: '01:00 AM - 04:00 PM', event: 'Swara Ekam / Sangam (Singing)', venue: 'HM Auditorium', category: 'cultural' },
            { time: '04:00 PM onwards', event: 'Closing Ceremony & Prize Distribution', venue: 'HM Auditorium', category: 'cultural' },
        ],
    },
];
