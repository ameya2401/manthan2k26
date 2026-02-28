import { Event } from './types';

// Category styling maps
export const categoryColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    technical: {
        bg: 'bg-blue-900/20',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-300',
    },
    cultural: {
        bg: 'bg-purple-900/20',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-300',
    },
    sports: {
        bg: 'bg-green-900/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        badge: 'bg-green-500/20 text-green-300',
    },
};

export const categoryIcons: Record<string, string> = {
    technical: '💻',
    cultural: '🎭',
    sports: '⚽',
};

export const sportsCommitteeStructure = {
    outdoor: ['Badminton', 'Box Cricket', 'Volleyball', 'Tug of war'],
    indoor: ['Chess', 'Carrom', 'Ludo', 'BGMI', 'Deadlift', 'Bench Press'],
} as const;

const sportsTrackByName: Record<string, 'indoor' | 'outdoor'> = {
    badminton: 'outdoor',
    'box cricket': 'outdoor',
    volleyball: 'outdoor',
    'tug of war': 'outdoor',
    'tug-of-war': 'outdoor',
    chess: 'indoor',
    carrom: 'indoor',
    ludo: 'indoor',
    bgmi: 'indoor',
    deadlift: 'indoor',
    'bench press': 'indoor',
    'bench-press': 'indoor',
    'e-sports': 'indoor',
    'e sports': 'indoor',
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
    });
}

export function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatDateTime(dateStr: string): string {
    return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
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
        date: 'March 15, 2026 - Day 1',
        slots: [
            { time: '08:00 AM', event: 'Box Cricket', venue: 'Cricket Ground', category: 'sports' },
            { time: '10:00 AM', event: 'Prompt2Website: The Vibe Coding Challenge', venue: 'Computer Lab 1', category: 'technical' },
            { time: '12:30 PM', event: 'QuizStorm: Battle of Brains', venue: 'Computer Lab 2', category: 'technical' },
            { time: '09:00 AM', event: 'Badminton', venue: 'Sports Court', category: 'sports' },
            { time: '11:00 AM', event: 'Chess', venue: 'Indoor Hall', category: 'sports' },
            { time: '12:00 PM', event: 'Carrom', venue: 'Indoor Hall', category: 'sports' },
            { time: '06:00 PM', event: 'NrityaVerse', venue: 'Main Stage', category: 'cultural' },
        ],
    },
    {
        date: 'March 16, 2026 - Day 2',
        slots: [
            { time: '08:00 AM', event: 'Volleyball', venue: 'Volleyball Court', category: 'sports' },
            { time: '09:00 AM', event: 'TypeSprint: The Ultimate Typing Showdown', venue: 'Computer Lab 2', category: 'technical' },
            { time: '10:00 AM', event: 'Tug of war', venue: 'Main Ground', category: 'sports' },
            { time: '11:00 AM', event: 'Ludo', venue: 'Indoor Hall', category: 'sports' },
            { time: '12:00 PM', event: 'BGMI', venue: 'E-Sports Arena', category: 'sports' },
            { time: '01:00 PM', event: 'Deadlift', venue: 'Fitness Arena', category: 'sports' },
            { time: '02:00 PM', event: 'Bench Press', venue: 'Fitness Arena', category: 'sports' },
            { time: '03:00 PM', event: 'SurTarang', venue: 'Seminar Hall', category: 'cultural' },
            { time: '04:00 PM', event: 'CanvaCraft: The Poster Design Challenge', venue: 'Computer Lab 1', category: 'technical' },
            { time: '06:00 PM', event: 'Closing Ceremony & Prize Distribution', venue: 'Main Stage', category: 'cultural' },
        ],
    },
];
