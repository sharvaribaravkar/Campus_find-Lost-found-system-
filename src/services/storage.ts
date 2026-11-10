import { College, User, Category, Item, Claim, Notification, Complaint, SmartMatchResult } from '../types';
import { 
  INITIAL_COLLEGES, 
  INITIAL_CATEGORIES, 
  INITIAL_USERS, 
  INITIAL_ITEMS, 
  INITIAL_CLAIMS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_COMPLAINTS 
} from '../data/initialData';

const STORAGE_KEYS = {
  COLLEGES: 'campusfind_colleges_v1',
  USERS: 'campusfind_users_v1',
  CATEGORIES: 'campusfind_categories_v1',
  ITEMS: 'campusfind_items_v1',
  CLAIMS: 'campusfind_claims_v1',
  NOTIFICATIONS: 'campusfind_notifications_v1',
  COMPLAINTS: 'campusfind_complaints_v1',
  CURRENT_USER: 'campusfind_current_user_v1',
};

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // Initialize data if not present
  public init() {
    if (!localStorage.getItem(STORAGE_KEYS.COLLEGES)) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.set(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.set(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.set(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    this.set(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
    this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.set(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  // --- COLLEGES ---
  public getColleges(): College[] {
    return this.get<College[]>(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
  }

  public getApprovedColleges(): College[] {
    return this.getColleges().filter(c => c.status === 'approved');
  }

  public getCollegeById(id: string): College | undefined {
    return this.getColleges().find(c => c.id === id);
  }

  public addCollege(college: Omit<College, 'id' | 'created_at' | 'updated_at'>): College {
    const colleges = this.getColleges();
    const newCollege: College = {
      ...college,
      id: `col_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    colleges.unshift(newCollege);
    this.set(STORAGE_KEYS.COLLEGES, colleges);

    // Notify Super Admin
    this.addNotification({
      user_id: 'usr_superadmin',
      college_id: newCollege.id,
      title: 'New College Registration',
      message: `${newCollege.name} registered and awaits your approval.`,
      link: '#colleges',
      type: 'college_approval',
    });

    return newCollege;
  }

  public updateCollegeStatus(id: string, status: College['status'], rejectionReason?: string): College | null {
    const colleges = this.getColleges();
    const index = colleges.findIndex(c => c.id === id);
    if (index === -1) return null;

    colleges[index] = {
      ...colleges[index],
      status,
      rejection_reason: rejectionReason || undefined,
      updated_at: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.COLLEGES, colleges);

    // If approved, create or activate the college admin account if admin info exists
    if (status === 'approved' && colleges[index].admin_email) {
      const users = this.getUsers();
      const existing = users.find(u => u.email === colleges[index].admin_email);
      if (!existing) {
        this.addUser({
          college_id: id,
          name: colleges[index].admin_name || `${colleges[index].code} Admin`,
          email: colleges[index].admin_email!,
          role: 'college_admin',
          status: 'active',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        });
      }
    }

    return colleges[index];
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getUsersByCollege(collegeId: string): User[] {
    return this.getUsers().filter(u => u.college_id === collegeId && u.role === 'student');
  }

  public addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    users.unshift(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.USERS, users);
    return users[idx];
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.get<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const list = this.getCategories();
    const newCat = { ...cat, id: `cat_${Date.now()}` };
    list.push(newCat);
    this.set(STORAGE_KEYS.CATEGORIES, list);
    return newCat;
  }

  public deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.CATEGORIES, list);
  }

  // --- ITEMS (WITH STRICT BACKEND-STYLE COLLEGE AUTHORIZATION) ---
  public getItems(filters?: {
    collegeId?: string | null;
    type?: 'lost' | 'found';
    category?: string;
    search?: string;
    status?: string;
    globalSearch?: boolean;
  }): Item[] {
    let items = this.get<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);

    // Filter by college unless globalSearch is explicitly true
    if (filters?.collegeId && !filters.globalSearch) {
      items = items.filter(item => item.college_id === filters.collegeId);
    }

    if (filters?.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters?.category && filters.category !== 'all') {
      items = items.filter(item => item.category_id === filters.category);
    }

    if (filters?.status && filters.status !== 'all') {
      items = items.filter(item => item.status === filters.status);
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location_name.toLowerCase().includes(q)
      );
    }

    return items;
  }

  public getItemById(id: string): Item | undefined {
    return this.get<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS).find(i => i.id === id);
  }

  public addItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Item {
    const items = this.getItems();
    const newItem: Item = {
      ...item,
      id: `item_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.set(STORAGE_KEYS.ITEMS, items);

    // Auto-check for Smart Matches!
    this.runSmartMatchingForItem(newItem);

    return newItem;
  }

  public updateItem(id: string, updates: Partial<Item>): Item | null {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.ITEMS, items);
    return items[idx];
  }

  public deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.ITEMS, filtered);
    return true;
  }

  // --- SMART ITEM MATCHING ALGORITHM ---
  public runSmartMatchingForItem(newItem: Item): SmartMatchResult[] {
    const allItems = this.getItems();
    const targetType = newItem.type === 'lost' ? 'found' : 'lost';
    
    // Look within same college first
    const candidates = allItems.filter(i => 
      i.college_id === newItem.college_id &&
      i.type === targetType &&
      i.status === 'active' &&
      i.id !== newItem.id
    );

    const matches: SmartMatchResult[] = [];

    const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'near', 'lost', 'found', 'please', 'this', 'that', 'case', 'room', 'hall']);
    const getTokens = (str: string) => 
      str.toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    const newTokens = new Set([...getTokens(newItem.title), ...getTokens(newItem.description)]);

    for (const cand of candidates) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Same category = +35 points
      if (newItem.category_id === cand.category_id) {
        score += 35;
        const cat = this.getCategories().find(c => c.id === newItem.category_id);
        reasons.push(`Same category: ${cat?.name || 'Category'}`);
      }

      // 2. Keyword overlap in title & description
      const candTokens = [...getTokens(cand.title), ...getTokens(cand.description)];
      const overlap = candTokens.filter(t => newTokens.has(t));
      const uniqueOverlap = Array.from(new Set(overlap));

      if (uniqueOverlap.length > 0) {
        const keywordScore = Math.min(45, uniqueOverlap.length * 15);
        score += keywordScore;
        reasons.push(`Matching keywords: "${uniqueOverlap.slice(0, 4).join(', ')}"`);
      }

      // 3. Location similarity
      const loc1 = newItem.location_name.toLowerCase();
      const loc2 = cand.location_name.toLowerCase();
      if (loc1.includes(loc2) || loc2.includes(loc1) || 
          loc1.split(' ').some(w => w.length > 3 && loc2.includes(w))) {
        score += 20;
        reasons.push(`Close campus location: ${newItem.location_name}`);
      }

      // 4. Proximity in date (within 5 days)
      const date1 = new Date(newItem.date_occurred).getTime();
      const date2 = new Date(cand.date_occurred).getTime();
      const diffDays = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
      if (diffDays <= 4) {
        score += 15;
        reasons.push(`Reported around same timeframe (~${Math.round(diffDays)} day diff)`);
      }

      if (score >= 40) {
        const result: SmartMatchResult = {
          lostItem: newItem.type === 'lost' ? newItem : cand,
          foundItem: newItem.type === 'found' ? newItem : cand,
          matchScore: Math.min(100, score),
          matchReasons: reasons,
        };
        matches.push(result);

        // Notify both students of the smart match!
        const lostOwnerId = result.lostItem.user_id;
        const foundReporterId = result.foundItem.user_id;

        this.addNotification({
          user_id: lostOwnerId,
          college_id: newItem.college_id,
          title: '⚡ Smart Match Detected!',
          message: `A found item "${result.foundItem.title}" strongly matches your lost report "${result.lostItem.title}". Check details to claim!`,
          link: `#match_${result.foundItem.id}`,
          type: 'match',
        });

        if (foundReporterId !== lostOwnerId) {
          this.addNotification({
            user_id: foundReporterId,
            college_id: newItem.college_id,
            title: 'Possible Owner Identified!',
            message: `Student reported lost "${result.lostItem.title}" matching the item you found.`,
            link: `#match_${result.lostItem.id}`,
            type: 'match',
          });
        }
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  public getSmartMatchesForCollege(collegeId: string): SmartMatchResult[] {
    const lostItems = this.getItems({ collegeId, type: 'lost', status: 'active' });
    const foundItems = this.getItems({ collegeId, type: 'found', status: 'active' });

    const results: SmartMatchResult[] = [];
    const seenPairs = new Set<string>();

    for (const lost of lostItems) {
      for (const found of foundItems) {
        const pairKey = `${lost.id}_${found.id}`;
        if (seenPairs.has(pairKey)) continue;

        let score = 0;
        const reasons: string[] = [];

        if (lost.category_id === found.category_id) {
          score += 35;
          const cat = this.getCategories().find(c => c.id === lost.category_id);
          reasons.push(`Same category: ${cat?.name}`);
        }

        const getTokens = (str: string) => 
          str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2);
        
        const t1 = new Set([...getTokens(lost.title), ...getTokens(lost.description)]);
        const t2 = [...getTokens(found.title), ...getTokens(found.description)];
        const overlap = Array.from(new Set(t2.filter(t => t1.has(t))));

        if (overlap.length > 0) {
          score += Math.min(45, overlap.length * 15);
          reasons.push(`Keywords: "${overlap.slice(0, 4).join(', ')}"`);
        }

        const l1 = lost.location_name.toLowerCase();
        const l2 = found.location_name.toLowerCase();
        if (l1.includes(l2) || l2.includes(l1) || l1.split(' ').some(w => w.length > 3 && l2.includes(w))) {
          score += 20;
          reasons.push(`Campus vicinity match`);
        }

        if (score >= 40) {
          seenPairs.add(pairKey);
          results.push({
            lostItem: lost,
            foundItem: found,
            matchScore: Math.min(100, score),
            matchReasons: reasons,
          });
        }
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  // --- CLAIMS ---
  public getClaims(collegeId?: string): Claim[] {
    const claims = this.get<Claim[]>(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
    if (collegeId) {
      return claims.filter(c => c.college_id === collegeId);
    }
    return claims;
  }

  public getClaimsByUser(userId: string): Claim[] {
    return this.get<Claim[]>(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS).filter(c => c.claimant_user_id === userId);
  }

  public submitClaim(data: Omit<Claim, 'id' | 'status' | 'created_at' | 'updated_at'>): Claim {
    const claims = this.getClaims();
    const newClaim: Claim = {
      ...data,
      id: `clm_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    claims.unshift(newClaim);
    this.set(STORAGE_KEYS.CLAIMS, claims);

    // Mark item status as claimed/under verification
    this.updateItem(data.item_id, { status: 'claimed' });

    // Notify College Admin
    const item = this.getItemById(data.item_id);
    const claimant = this.getUserById(data.claimant_user_id);
    const admins = this.getUsers().filter(u => u.college_id === data.college_id && u.role === 'college_admin');
    
    admins.forEach(admin => {
      this.addNotification({
        user_id: admin.id,
        college_id: data.college_id,
        title: 'New Ownership Claim Submitted',
        message: `${claimant?.name || 'A student'} submitted a claim for "${item?.title || 'item'}". Review required.`,
        link: '#claims',
        type: 'claim_submitted',
      });
    });

    return newClaim;
  }

  public updateClaimStatus(
    claimId: string, 
    status: Claim['status'], 
    adminRemarks?: string, 
    adminId?: string
  ): Claim | null {
    const claims = this.getClaims();
    const idx = claims.findIndex(c => c.id === claimId);
    if (idx === -1) return null;

    claims[idx] = {
      ...claims[idx],
      status,
      admin_remarks: adminRemarks || claims[idx].admin_remarks,
      reviewed_by: adminId || claims[idx].reviewed_by,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.CLAIMS, claims);

    const claim = claims[idx];
    const item = this.getItemById(claim.item_id);

    // If claim is completed (returned), update item to returned
    if (status === 'completed') {
      this.updateItem(claim.item_id, { status: 'returned' });
    } else if (status === 'rejected') {
      this.updateItem(claim.item_id, { status: 'active' });
    } else if (status === 'approved') {
      this.updateItem(claim.item_id, { status: 'claimed' });
    }

    // Notify Claimant Student
    this.addNotification({
      user_id: claim.claimant_user_id,
      college_id: claim.college_id,
      title: status === 'approved' 
        ? 'Claim Approved! 🎉' 
        : status === 'completed'
        ? 'Item Handed Over Successfully! 🏆' 
        : 'Claim Rejected',
      message: status === 'approved'
        ? `Your claim for "${item?.title || 'item'}" was approved! Visit the college admin / security cabin with your ID card to collect it.`
        : status === 'completed'
        ? `"${item?.title || 'item'}" is marked as safely returned to you. Thank you for using CampusFind!`
        : `Your claim for "${item?.title || 'item'}" was rejected. Reason: ${adminRemarks || 'Insufficient proof'}.`,
      type: status === 'approved' || status === 'completed' ? 'claim_approved' : 'claim_rejected',
    });

    return claim;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): Notification[] {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs.filter(n => n.user_id === userId);
  }

  public addNotification(n: Omit<Notification, 'id' | 'is_read' | 'created_at'>): Notification {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  public deleteNotification(id: string): void {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs.filter(n => n.id !== id));
  }

  // --- COMPLAINTS ---
  public getComplaints(collegeId?: string): Complaint[] {
    const comps = this.get<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    if (collegeId) {
      return comps.filter(c => c.college_id === collegeId);
    }
    return comps;
  }

  public addComplaint(c: Omit<Complaint, 'id' | 'status' | 'created_at' | 'updated_at'>): Complaint {
    const comps = this.getComplaints();
    const newComp: Complaint = {
      ...c,
      id: `comp_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    comps.unshift(newComp);
    this.set(STORAGE_KEYS.COMPLAINTS, comps);
    return newComp;
  }

  public updateComplaintStatus(id: string, status: Complaint['status'], resolutionNotes?: string): Complaint | null {
    const comps = this.getComplaints();
    const idx = comps.findIndex(c => c.id === id);
    if (idx === -1) return null;
    comps[idx] = {
      ...comps[idx],
      status,
      resolution_notes: resolutionNotes || comps[idx].resolution_notes,
      updated_at: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.COMPLAINTS, comps);
    return comps[idx];
  }

  // --- PLATFORM / COLLEGE ANALYTICS ---
  public getPlatformStats() {
    const colleges = this.getColleges();
    const users = this.getUsers();
    const items = this.getItems();
    const claims = this.getClaims();

    const totalColleges = colleges.filter(c => c.status === 'approved').length;
    const pendingColleges = colleges.filter(c => c.status === 'pending').length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const lostItems = items.filter(i => i.type === 'lost').length;
    const foundItems = items.filter(i => i.type === 'found').length;
    const returnedItems = items.filter(i => i.status === 'returned').length;
    const pendingClaims = claims.filter(c => c.status === 'pending').length;

    const recoveryRate = items.length > 0 ? Math.round((returnedItems / items.length) * 100) : 0;

    return {
      totalColleges,
      pendingColleges,
      totalStudents,
      lostItems,
      foundItems,
      returnedItems,
      pendingClaims,
      recoveryRate,
    };
  }

  public getCollegeStats(collegeId: string) {
    const users = this.getUsersByCollege(collegeId);
    const items = this.getItems({ collegeId });
    const claims = this.getClaims(collegeId);

    const totalStudents = users.length;
    const lostItems = items.filter(i => i.type === 'lost').length;
    const foundItems = items.filter(i => i.type === 'found').length;
    const returnedItems = items.filter(i => i.status === 'returned').length;
    const pendingClaims = claims.filter(c => c.status === 'pending').length;
    const activeItems = items.filter(i => i.status === 'active').length;

    return {
      totalStudents,
      lostItems,
      foundItems,
      returnedItems,
      pendingClaims,
      activeItems,
    };
  }
}

export const storage = new StorageService();
storage.init();
