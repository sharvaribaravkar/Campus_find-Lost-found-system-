export type UserRole = 'super_admin' | 'college_admin' | 'student';

export type CollegeStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface College {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  status: CollegeStatus;
  logo_url: string;
  admin_name?: string;
  admin_email?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  college_id: string | null; // null for super_admin
  name: string;
  email: string;
  roll_number?: string;
  department?: string;
  academic_year?: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'claimed' | 'returned' | 'rejected';

export interface Item {
  id: string;
  college_id: string;
  user_id: string;
  title: string;
  category_id: string;
  type: ItemType;
  description: string;
  image_url: string;
  date_occurred: string;
  time_occurred: string;
  location_name: string;
  status: ItemStatus;
  contact_preference: string;
  // Lost specific fields
  reward_notes?: string;
  additional_details?: string;
  // Found specific fields
  deposit_location?: string;
  is_sensitive_id_card?: boolean;
  created_at: string;
  updated_at: string;
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Claim {
  id: string;
  item_id: string;
  claimant_user_id: string;
  college_id: string;
  claim_reason: string;
  proof_url?: string;
  proof_text?: string;
  status: ClaimStatus;
  admin_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  college_id: string;
  title: string;
  message: string;
  link?: string;
  type: 'match' | 'claim_submitted' | 'claim_approved' | 'claim_rejected' | 'status_changed' | 'college_approval';
  is_read: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  college_id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'investigating' | 'resolved';
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  college_id: string;
  rating: number;
  comments: string;
  created_at: string;
}

export interface SmartMatchResult {
  lostItem: Item;
  foundItem: Item;
  matchScore: number;
  matchReasons: string[];
}
