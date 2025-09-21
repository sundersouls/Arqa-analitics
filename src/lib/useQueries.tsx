import { useQuery } from "@tanstack/react-query";
import { Order, Customer } from "./types";
import ordersData from "@/data/orders.json";
import customersData from "@/data/customers.json";

export interface FilterParams {
  period?: string;
  city?: string;
  channel?: string;
}

const fetchOrders = async (filters: FilterParams): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch orders data");
  }

  const endDate = new Date();
  const startDate = new Date();

  if (filters.period === "7d") {
    startDate.setDate(endDate.getDate() - 7);
  } else if (filters.period === "30d") {
    startDate.setDate(endDate.getDate() - 30);
  } else if (filters.period === "QTD") {
    const currentQuarter = Math.floor(endDate.getMonth() / 3);
    startDate.setMonth(currentQuarter * 3);
    startDate.setDate(1);
  } else if (filters.period === "YTD") {
    startDate.setMonth(0);
    startDate.setDate(1);
  } else {
    startDate.setDate(endDate.getDate() - 7);
  }

  const startDateStr = startDate.toISOString().split("T")[0];

  return ordersData.orders.filter((order: Order) => {
    const dateMatch = order.date >= startDateStr;
    const cityMatch = !filters.city || order.city === filters.city;
    const channelMatch = !filters.channel || order.channel === filters.channel;

    return dateMatch && cityMatch && channelMatch;
  });
};

const fetchAllOrders = async (): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (Math.random() < 0.05) {
    throw new Error("Failed to fetch orders data");
  }

  return ordersData.orders;
};

const fetchCustomers = async (): Promise<Customer[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (Math.random() < 0.05) {
    throw new Error("Failed to fetch customers data");
  }

  return customersData.customers;
};

const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const order = ordersData.orders.find((order: Order) => order.id === orderId);
  return order || null;
};

const fetchOrdersByCustomerId = async (
  customerId: string,
): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return ordersData.orders.filter(
    (order: Order) => order.customerId === customerId,
  );
};

export const useOrdersQuery = (filters: FilterParams = { period: "7d" }) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
    staleTime: 60000,
  });
};

export const useAllOrdersQuery = () => {
  return useQuery({
    queryKey: ["orders", "all"],
    queryFn: fetchAllOrders,
    staleTime: 60000,
  });
};

export const useCustomersQuery = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    staleTime: 60000,
  });
};

export const useOrderByIdQuery = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
    staleTime: 60000,
  });
};

export const useOrdersByCustomerIdQuery = (customerId: string) => {
  return useQuery({
    queryKey: ["orders", "customer", customerId],
    queryFn: () => fetchOrdersByCustomerId(customerId),
    enabled: !!customerId,
    staleTime: 60000,
  });
};
