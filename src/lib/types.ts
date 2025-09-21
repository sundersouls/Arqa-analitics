export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  customerId: string;
  city: string;
  channel: string;
  status: string;
  total: number;
  items: OrderItem[];
  comment?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  city: string;
  ltv: number;
  ordersCount: number;
}

export interface DailyVisit {
  date: string;
  visits: number;
  uniqueVisitors: number;
}

export interface Analytics {
  dailyVisits: DailyVisit[];
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface CustomersResponse {
  customers: Customer[];
}

export interface AnalyticsResponse {
  analytics: Analytics;
}

export interface DashboardMetrics {
  revenue: number;
  ordersCount: number;
  aov: number;
  conversionRate: number;
}
