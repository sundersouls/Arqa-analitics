import { describe, it, expect } from "@jest/globals";
import { Order } from "@/lib/types";

// Dashboard utility functions (move these to src/lib/dashboard-utils.ts later)
export const calculateDashboardAggregates = (orders: Order[]) => {
  if (!orders || orders.length === 0) {
    return {
      revenue: 0,
      ordersCount: 0,
      aov: 0,
      conversionRate: 0,
    };
  }

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const ordersCount = orders.length;
  const aov = ordersCount > 0 ? revenue / ordersCount : 0;

  // Mock conversion rate calculation
  const conversionRate = ordersCount * 0.05; // 5% mock rate

  return {
    revenue,
    ordersCount,
    aov: Math.round(aov),
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
};

export const groupOrdersByDate = (orders: Order[]) => {
  const dateMap = new Map<string, number>();

  orders.forEach((order) => {
    const currentValue = dateMap.get(order.date) || 0;
    dateMap.set(order.date, currentValue + order.total);
  });

  return Array.from(dateMap.entries())
    .map(([date, revenue]) => ({
      date,
      revenue,
      displayDate: new Date(date).toLocaleDateString("ru-RU", {
        month: "short",
        day: "numeric",
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Tests
describe("Dashboard Aggregates", () => {
  const mockOrders: Order[] = [
    {
      id: "1",
      date: "2024-01-01",
      customerId: "customer1",
      city: "Алматы",
      channel: "Web",
      status: "delivered",
      total: 10000,
      items: [{ sku: "SKU1", name: "Item 1", qty: 1, price: 10000 }],
    },
    {
      id: "2",
      date: "2024-01-02",
      customerId: "customer2",
      city: "Нур-Султан",
      channel: "Mobile",
      status: "processing",
      total: 15000,
      items: [{ sku: "SKU2", name: "Item 2", qty: 2, price: 7500 }],
    },
    {
      id: "3",
      date: "2024-01-01",
      customerId: "customer3",
      city: "Алматы",
      channel: "Web",
      status: "shipped",
      total: 5000,
      items: [{ sku: "SKU3", name: "Item 3", qty: 1, price: 5000 }],
    },
  ];

  it("should calculate correct revenue", () => {
    const result = calculateDashboardAggregates(mockOrders);
    expect(result.revenue).toBe(30000);
  });

  it("should calculate correct orders count", () => {
    const result = calculateDashboardAggregates(mockOrders);
    expect(result.ordersCount).toBe(3);
  });

  it("should calculate correct average order value", () => {
    const result = calculateDashboardAggregates(mockOrders);
    expect(result.aov).toBe(10000); // 30000 / 3 = 10000
  });

  it("should handle empty orders array", () => {
    const result = calculateDashboardAggregates([]);
    expect(result).toEqual({
      revenue: 0,
      ordersCount: 0,
      aov: 0,
      conversionRate: 0,
    });
  });

  it("should handle null/undefined orders", () => {
    const result = calculateDashboardAggregates(null as any);
    expect(result).toEqual({
      revenue: 0,
      ordersCount: 0,
      aov: 0,
      conversionRate: 0,
    });
  });
});

describe("Group Orders By Date", () => {
  const mockOrders: Order[] = [
    {
      id: "1",
      date: "2024-01-01",
      customerId: "customer1",
      city: "Алматы",
      channel: "Web",
      status: "delivered",
      total: 10000,
      items: [],
    },
    {
      id: "2",
      date: "2024-01-02",
      customerId: "customer2",
      city: "Нур-Султан",
      channel: "Mobile",
      status: "processing",
      total: 15000,
      items: [],
    },
    {
      id: "3",
      date: "2024-01-01",
      customerId: "customer3",
      city: "Алматы",
      channel: "Web",
      status: "shipped",
      total: 5000,
      items: [],
    },
  ];

  it("should group orders by date correctly", () => {
    const result = groupOrdersByDate(mockOrders);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2024-01-01");
    expect(result[0].revenue).toBe(15000); // 10000 + 5000
    expect(result[1].date).toBe("2024-01-02");
    expect(result[1].revenue).toBe(15000);
  });

  it("should sort dates chronologically", () => {
    const result = groupOrdersByDate(mockOrders);
    expect(result[0].date).toBe("2024-01-01");
    expect(result[1].date).toBe("2024-01-02");
  });
});
