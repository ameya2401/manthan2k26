export interface Event {
    id: string;
    name: string;
    slug: string;
    description: string;
    long_description: string | null;
    category: 'technical' | 'cultural' | 'sports';
    fee: number; // in paise
    fee_calculation: 'per_team' | 'per_participant';
    max_participants: number;
    current_participants: number;
    event_date: string;
    registration_deadline: string | null;
    venue: string;
    lead_coordinator?: string | null;
    rules: string[];
    prize_text: string | null;
    prize_winner: number | null;
    prize_runner_up: number | null;
    prize_second_runner_up: number | null;
    image_url: string | null;
    is_active: boolean;
    team_size: number;
    team_size_fixed: number | null;
    team_size_min: number | null;
    team_size_max: number | null;
    created_at: string;
}

export interface TeamMember {
    name: string;
}

export interface TeamRegistration {
    event_id: string;
    team_name: string | null;
    team_size: number;
    members: TeamMember[];
}

export interface Registration {
    id: string;
    ticket_id: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    year: string | null;
    department: string | null;
    event_ids: string[];
    team_registrations: TeamRegistration[];
    total_amount: number; // in paise
    payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    payment_method: 'razorpay' | 'cash' | null;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    razorpay_signature: string | null;
    cash_amount: number | null;
    cash_received_by: string | null;
    cash_received_at: string | null;
    cash_receipt_number: string | null;
    cash_notes: string | null;
    checked_in: boolean;
    checked_in_at: string | null;
    checked_in_by: string | null;
    qr_code: string | null;
    created_at: string;
    updated_at: string;
}

export interface RegistrationFormData {
    name: string;
    email: string;
    phone: string;
    college: string;
    year: string;
    department: string;
    event_ids: string[];
    team_registrations: TeamRegistration[];
}

export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
}

export interface PaymentVerification {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface AdminUser {
    id: string;
    email: string;
    role: 'admin' | 'staff';
    name: string | null;
    created_at: string;
}

export interface ManualCashEntry {
    id: string;
    payer_name: string;
    payer_phone: string | null;
    payer_email: string | null;
    amount: number;
    receipt_number: string | null;
    notes: string | null;
    collected_by: string | null;
    collected_at: string;
    created_at: string;
    updated_at: string;
}
