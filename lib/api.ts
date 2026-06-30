import axios, { type AxiosRequestHeaders } from "axios";
import type { ConciergeSession } from "@/lib/concierge-types";
import { getApiBaseUrl } from "@/lib/api-config";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("xoxo_token");
    if (token) {
      config.headers = (config.headers || {}) as AxiosRequestHeaders;
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 → clear token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("xoxo_token");
    }
    return Promise.reject(err);
  }
);

export default api;
export { getApiBaseUrl, getApiDebugInfo, getSocketBaseUrl, resolveApiUrl } from "@/lib/api-config";

/* ---- Typed-light API helpers ---- */
type AnyObj = Record<string, unknown>;

export const authAPI = {
  login: (data: AnyObj) => api.post("/auth/login", data),
  register: (data: AnyObj) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
};

export const packagesAPI = {
  getAll: (params?: AnyObj) => api.get("/packages", { params }),
  getById: (id: string) => api.get(`/packages/${id}`),
  getBySlug: (slug: string) => api.get(`/packages/slug/${slug}`),
  getTrending: () => api.get("/packages/trending"),
  getVisaFree: () => api.get("/packages/visa-free"),
  recentBookings: () => api.get("/packages/recent-bookings"),
  getFlightSuggestions: (id: string) => api.get(`/packages/${id}/flights`),
  getHotelSuggestions: (id: string) => api.get(`/packages/${id}/hotels`),
  getChecklist: (id: string) => api.get(`/packages/${id}/checklist`),
  getAllAdmin: () => api.get("/packages/admin/list"),
  create: (data: AnyObj) => api.post("/packages", data),
  update: (id: string, data: AnyObj) => api.put(`/packages/${id}`, data),
  remove: (id: string) => api.delete(`/packages/${id}`),
};

export const destinationsAPI = {
  getAll: (params?: AnyObj) => api.get("/destinations", { params }),
  getById: (id: string) => api.get(`/destinations/${id}`),
  getBySlug: (slug: string) => api.get(`/destinations/slug/${slug}`),
  getTrending: () => api.get("/destinations/trending"),
  getAdventure: () => api.get("/destinations/adventure"),
  search: (q: string) => api.get("/destinations/search", { params: { q } }),
  autocomplete: (q: string) => api.get("/destinations/autocomplete", { params: { q } }),
  create: (data: AnyObj) => api.post("/destinations", data),
  update: (id: string, data: AnyObj) => api.put(`/destinations/${id}`, data),
  remove: (id: string) => api.delete(`/destinations/${id}`),
};

export const aiAPI = {
  generateItinerary: (data: AnyObj) => api.post("/ai/itinerary", data),
  chatExpert: (messages: AnyObj[]) => api.post("/ai/chat", { messages }),
  destinationTips: (destination: string) => api.post("/ai/destination-tips", { destination }),
};

const conciergeHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const guestId = localStorage.getItem("xoxo_concierge_guest");
    if (guestId) headers["x-guest-id"] = guestId;
  }
  return headers;
};

export const conciergeAPI = {
  prompts: () => api.get("/concierge/prompts"),
  createSession: () =>
    api.post("/concierge/sessions", {}, { headers: conciergeHeaders() }),
  getSession: (id: string) =>
    api.get(`/concierge/sessions/${id}`, { headers: conciergeHeaders() }),
  sendMessage: (id: string, message: string) =>
    api.post(
      `/concierge/sessions/${id}/message`,
      { message },
      { headers: conciergeHeaders() }
    ),
  saveItinerary: (id: string) => api.post(`/concierge/sessions/${id}/save`),
  getShared: (token: string) => api.get(`/concierge/share/${token}`),
  streamMessage: async (
    id: string,
    message: string,
    onToken: (text: string) => void,
    onDone: (session: ConciergeSession) => void
  ) => {
    const base = getApiBaseUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("xoxo_token") : null;
    const guestId = typeof window !== "undefined" ? localStorage.getItem("xoxo_concierge_guest") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (guestId) headers["x-guest-id"] = guestId;

    const res = await fetch(`${base}/concierge/sessions/${id}/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message, stream: true }),
    });
    if (!res.ok || !res.body) throw new Error("Stream failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) {
        const lines = part.split("\n");
        let event = "message";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:")) data = line.slice(5).trim();
        }
        if (!data) continue;
        try {
          const parsed = JSON.parse(data);
          if (event === "token") onToken(parsed.text || "");
          if (event === "done") onDone(parsed.session as ConciergeSession);
        } catch {
          /* skip */
        }
      }
    }
  },
};

export const searchAPI = {
  global: (q: string) => api.get("/search", { params: { q } }),
};

export const bookingsAPI = {
  create: (data: AnyObj) => api.post("/bookings", data),
  createTransport: (data: AnyObj) => api.post("/bookings/transport", data),
  getMy: () => api.get("/bookings/my"),
  getAll: (params?: AnyObj) => api.get("/bookings", { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id: string, status: string) => api.put(`/bookings/${id}/status`, { status }),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  seedStatus: () => api.get("/admin/seed/status"),
  getAnalyticsSummary: () => api.get("/analytics/summary"),
  exportNewsletter: () => api.get("/newsletter/export", { responseType: "blob" }),
  getNewsletterCount: () => api.get("/newsletter/count"),
  getContactMessages: () => api.get("/contact/messages"),
  getSupportTickets: () => api.get("/support/tickets"),
  listUsers: (params?: AnyObj) => api.get("/admin/users", { params }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: AnyObj) => api.patch(`/admin/users/${id}`, data),
  listGuides: (params?: AnyObj) => api.get("/admin/guides", { params }),
  getGuide: (id: string) => api.get(`/admin/guides/${id}`),
  createGuide: (data: AnyObj) => api.post("/admin/guides", data),
  updateGuide: (id: string, data: AnyObj) => api.put(`/admin/guides/${id}`, data),
  deleteGuide: (id: string) => api.delete(`/admin/guides/${id}`),
  listGroups: (params?: AnyObj) => api.get("/admin/groups", { params }),
  getGroup: (id: string) => api.get(`/admin/groups/${id}`),
  createGroup: (data: AnyObj) => api.post("/admin/groups", data),
  updateGroup: (id: string, data: AnyObj) => api.put(`/admin/groups/${id}`, data),
  closeGroup: (id: string) => api.patch(`/admin/groups/${id}/close`),
  removeGroupMember: (groupId: string, userId: string) =>
    api.delete(`/admin/groups/${groupId}/members/${userId}`),
  deleteGroup: (id: string) => api.delete(`/admin/groups/${id}`),
  listReviews: (params?: AnyObj) => api.get("/admin/reviews", { params }),
  moderateReview: (id: string, status: string) => api.patch(`/admin/reviews/${id}`, { status }),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
  listCoupons: () => api.get("/admin/coupons"),
  createCoupon: (data: AnyObj) => api.post("/admin/coupons", data),
  updateCoupon: (id: string, data: AnyObj) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data: AnyObj) => api.put("/admin/settings", data),
};

export const settingsAPI = {
  get: () => api.get("/settings"),
};

export const analyticsAPI = {
  track: (data: AnyObj) => api.post("/analytics/track", data),
  summary: () => api.get("/analytics/summary"),
};

export const newsletterAPI = {
  subscribe: (data: { email: string; name?: string; source?: string }) =>
    api.post("/newsletter/subscribe", data),
};

export const contactAPI = {
  submit: (data: AnyObj) => api.post("/contact", data),
  createTicket: (data: AnyObj) => api.post("/support/tickets", data),
};

export const transportAPI = {
  status: () => api.get("/transport/status"),
  modes: () => api.get("/transport/modes"),
  search: (params: AnyObj) => api.get("/transport/search", { params }),
  recommendations: (params: AnyObj) => api.get("/transport/recommendations", { params }),
};

export const paymentsAPI = {
  getStatus: () => api.get("/payments/status"),
  createOrder: (bookingId: string) => api.post("/payments/order", { bookingId }),
  verify: (data: AnyObj) => api.post("/payments/verify", data),
  refund: (bookingId: string, amount?: number, reason?: string) =>
    api.post("/payments/refund", { bookingId, amount, reason }),
  getInvoice: (bookingId: string) => api.get(`/payments/invoice/${bookingId}`),
};

export const inventoryAPI = {
  status: () => api.get("/inventory/status"),
  searchFlights: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
    travelClass?: string;
  }) => api.get("/inventory/flights", { params }),
  searchHotels: (params: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    rooms?: number;
  }) => api.get("/inventory/hotels", { params }),
  searchActivities: (params: { latitude: number; longitude: number; radius?: number }) =>
    api.get("/inventory/activities", { params }),
  placesAutocomplete: (q: string) =>
    api.get("/inventory/places/autocomplete", { params: { q } }),
  geocode: (address: string) =>
    api.get("/inventory/places/geocode", { params: { address } }),
};

export const reviewsAPI = {
  getForPackage: (packageId: string) => api.get(`/reviews/package/${packageId}`),
  create: (data: AnyObj) => api.post("/reviews", data),
  remove: (id: string) => api.delete(`/reviews/${id}`),
};

export const usersAPI = {
  getWishlist: () => api.get("/users/wishlist"),
  toggleWishlist: (packageId: string) => api.post(`/users/wishlist/${packageId}`),
  updateProfile: (data: AnyObj) => api.put("/users/profile", data),
};

export const itinerariesAPI = {
  create: (data: AnyObj) => api.post("/itineraries", data),
  getMy: () => api.get("/itineraries/my"),
  getById: (id: string) => api.get(`/itineraries/${id}`),
  remove: (id: string) => api.delete(`/itineraries/${id}`),
};

export const visaAPI = {
  list: () => api.get("/visa"),
  getInfo: (country: string) => api.get(`/visa/${encodeURIComponent(country)}`),
  inquiry: (data: AnyObj) => api.post("/visa/inquiry", data),
};

export const uploadAPI = {
  image: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

export const notificationsAPI = {
  getMy: () => api.get("/notifications"),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

export const walletAPI = {
  get: () => api.get("/wallet"),
  redeem: (points: number) => api.post("/wallet/redeem", { points }),
  applyReferral: (code: string) => api.post("/wallet/referral", { code }),
};

export const guidesAPI = {
  getAll: (params?: AnyObj) => api.get("/guides", { params }),
  getById: (id: string) => api.get(`/guides/${id}`),
  create: (data: AnyObj) => api.post("/guides", data),
  updateMine: (data: AnyObj) => api.put("/guides/me", data),
  book: (id: string, data: AnyObj) => api.post(`/guides/${id}/book`, data),
};

export const chatAPI = {
  conversations: () => api.get("/chat/conversations"),
  thread: (peerId: string) => api.get(`/chat/${peerId}`),
  send: (peerId: string, content: string) => api.post(`/chat/${peerId}`, { content }),
};

export const matchAPI = {
  getProfile: () => api.get("/match/profile"),
  upsertProfile: (data: AnyObj) => api.put("/match/profile", data),
  discover: () => api.get("/match/discover"),
  getRequests: () => api.get("/match/requests"),
  sendRequest: (data: AnyObj) => api.post("/match/request", data),
  respond: (id: string, action: "accept" | "reject") =>
    api.put(`/match/requests/${id}/respond`, { action }),
  cancel: (id: string) => api.delete(`/match/requests/${id}`),
};

export const nearbyAPI = {
  getSettings: () => api.get("/nearby/me"),
  updateLocation: (lat: number, lng: number) =>
    api.put("/nearby/location", { latitude: lat, longitude: lng }),
  setPrivacy: (locationVisible: boolean) => api.put("/nearby/privacy", { locationVisible }),
  discover: (params: { lat: number; lng: number; radiusKm?: number; verifiedOnly?: boolean }) =>
    api.get("/nearby", { params }),
};

export const verificationAPI = {
  status: () => api.get("/verification/status"),
  submit: (data: AnyObj) => api.post("/verification/submit", data),
  pending: () => api.get("/verification/pending"),
  review: (id: string, action: "approve" | "reject", adminNote?: string) =>
    api.put(`/verification/${id}/review`, { action, adminNote }),
};

export const groupsAPI = {
  list: (params?: AnyObj) => api.get("/groups", { params }),
  my: () => api.get("/groups/my"),
  getById: (id: string) => api.get(`/groups/${id}`),
  create: (data: AnyObj) => api.post("/groups", data),
  join: (id: string) => api.post(`/groups/${id}/join`),
  leave: (id: string) => api.post(`/groups/${id}/leave`),
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
  getMessages: (id: string) => api.get(`/groups/${id}/messages`),
  sendMessage: (id: string, content: string) => api.post(`/groups/${id}/messages`, { content }),
};

export const postsAPI = {
  feed: (page?: number) => api.get("/posts", { params: { page } }),
  create: (data: AnyObj) => api.post("/posts", data),
  like: (id: string) => api.post(`/posts/${id}/like`),
  share: (id: string) => api.post(`/posts/${id}/share`),
  getComments: (id: string) => api.get(`/posts/${id}/comments`),
  addComment: (id: string, content: string) => api.post(`/posts/${id}/comments`, { content }),
  remove: (id: string) => api.delete(`/posts/${id}`),
};

export const friendsAPI = {
  list: () => api.get("/friends"),
  requests: () => api.get("/friends/requests"),
  getStatus: (userId: string) => api.get(`/friends/status/${userId}`),
  getStatuses: (userIds: string[]) =>
    api.get("/friends/status", { params: { ids: userIds.join(",") } }),
  sendRequest: (userId: string) => api.post("/friends/request", { userId }),
  respond: (id: string, action: "accept" | "reject") =>
    api.put(`/friends/${id}/respond`, { action }),
  remove: (id: string) => api.delete(`/friends/${id}`),
};
