export interface AdminDashboardStats {
  totalPackages: number;
  totalDestinations: number;
  totalBookings: number;
  totalUsers: number;
  todayBookings: number;
  todayRevenue: number;
  activeUsers: number;
  pendingPayments: number;
  cancelledTrips: number;
  newReviews: number;
}

export interface ChartPoint {
  _id: string;
  count?: number;
  revenue?: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  charts: {
    monthlyBookings: ChartPoint[];
    monthlyRevenue: ChartPoint[];
    topPackages: { id: string; title: string; count: number }[];
    topDestinations: { name: string; slug?: string; country?: string }[];
  };
  activity: {
    recentBookings: Record<string, unknown>[];
    recentUsers: Record<string, unknown>[];
    recentPayments: Record<string, unknown>[];
    recentNotifications: Record<string, unknown>[];
  };
}
