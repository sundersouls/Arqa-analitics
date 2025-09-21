import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import OrdersPage from "@/app/orders/page";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";

// Mock the queries - the key issue is your component is getting real data, not test data
const mockUseAllOrdersQuery = jest.fn();

jest.mock("@/lib/useQueries", () => ({
  useAllOrdersQuery: () => mockUseAllOrdersQuery(),
}));

// Mock toast
jest.mock("@/lib/useToast", () => ({
  useToast: () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }),
}));

// Mock UI components
jest.mock("@/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className}>
      Loading...
    </div>
  ),
}));

jest.mock("@/components/spinner", () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

// Mock i18n with actual Russian translations from your component
jest.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        orders: "Заказы",
        ordersTable: "Таблица заказов",
        orderId: "ID заказа",
        date: "Дата",
        customer: "Клиент",
        city: "Город",
        channel: "Канал",
        status: "Статус",
        total: "Сумма",
        searchPlaceholder: "Поиск по заказам...",
        sortBy: "Сортировать по",
        selectedItems: "выбрано",
        changeStatus: "Изменить статус",
        new: "Новый",
        processing: "В обработке",
        shipped: "Отправлен",
        delivered: "Доставлен",
        cancelled: "Отменен",
        orderDetails: "Детали заказа",
        orderItems: "Товары заказа",
        comment: "Комментарий",
      };
      return translations[key] || key;
    },
  }),
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe("Orders Table", () => {
  // Use realistic data that matches your actual orders.json structure
  const mockOrders = [
    {
      id: "ORD-1001",
      date: "2025-01-15",
      customerId: "CUS-001",
      city: "Алматы",
      channel: "Web",
      status: "Completed",
      total: 52700,
      items: [
        { sku: "SKU-1", name: "Product A", qty: 2, price: 12000 },
        { sku: "SKU-2", name: "Product B", qty: 1, price: 28700 },
      ],
      comment: "Уточнить время доставки",
    },
    {
      id: "ORD-1002",
      date: "2025-01-14",
      customerId: "CUS-002",
      city: "Нур-Султан",
      channel: "Mobile",
      status: "Processing",
      total: 75300,
      items: [
        { sku: "SKU-3", name: "Product C", qty: 1, price: 45000 },
        { sku: "SKU-4", name: "Product D", qty: 3, price: 10100 },
      ],
      comment: "",
    },
    {
      id: "ORD-1003",
      date: "2025-01-13",
      customerId: "CUS-003",
      city: "Шымкент",
      channel: "Web",
      status: "Completed",
      total: 34500,
      items: [{ sku: "SKU-5", name: "Product E", qty: 2, price: 17250 }],
      comment: "Срочная доставка",
    },
    {
      id: "ORD-1004",
      date: "2025-01-12",
      customerId: "CUS-001",
      city: "Алматы",
      channel: "Web",
      status: "Completed",
      total: 89600,
      items: [
        { sku: "SKU-1", name: "Product A", qty: 4, price: 12000 },
        { sku: "SKU-6", name: "Product F", qty: 1, price: 41600 },
      ],
      comment: "",
    },
    {
      id: "ORD-1005",
      date: "2025-01-11",
      customerId: "CUS-004",
      city: "Актобе",
      channel: "Mobile",
      status: "New",
      total: 25900,
      items: [{ sku: "SKU-7", name: "Product G", qty: 1, price: 25900 }],
      comment: "Проверить наличие",
    },
    {
      id: "ORD-1006",
      date: "2025-09-21",
      customerId: "CUS-004",
      city: "Алматы",
      channel: "Mobile",
      status: "New",
      total: 25500,
      items: [{ sku: "SKU-8", name: "Product J", qty: 1, price: 25500 }],
      comment: "Проверить",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Don't return an error by default
    mockUseAllOrdersQuery.mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
      isError: false,
    });
  });

  describe("Rendering", () => {
    it("should render table with orders data", async () => {
      const { container } = render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("orders-table")).toBeInTheDocument();
      });

      // Check table headers using Russian text from your component
      expect(screen.getByText("ID заказа")).toBeInTheDocument();
      expect(screen.getByText("Дата")).toBeInTheDocument();
      expect(screen.getByText("Клиент")).toBeInTheDocument();
      expect(screen.getByText("Город")).toBeInTheDocument();
      expect(screen.getByText("Канал")).toBeInTheDocument();
      expect(screen.getByText("Статус")).toBeInTheDocument();
      expect(screen.getByText("Сумма")).toBeInTheDocument();

      // Check data rows using realistic order IDs
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
      expect(screen.getByText("ORD-1002")).toBeInTheDocument();
      expect(screen.getByText("ORD-1003")).toBeInTheDocument();

      // Snapshot test
      expect(
        container.querySelector('[data-testid="orders-table"]'),
      ).toMatchSnapshot();
    });

    it("should show loading skeleton when loading", async () => {
      mockUseAllOrdersQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      });

      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      expect(screen.getByTestId("loading-table")).toBeInTheDocument();
      // Check if skeletons exist (the exact count may vary based on your component)
      expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });

    it("should show empty state when no orders", async () => {
      mockUseAllOrdersQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
      });

      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("no-orders-message")).toBeInTheDocument();
        expect(screen.getByText("No orders available.")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should filter orders by search term", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
      });

      // Initially all orders should be visible
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
      expect(screen.getByText("ORD-1002")).toBeInTheDocument();
      expect(screen.getByText("ORD-1003")).toBeInTheDocument();

      // Search for specific order
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "ORD-1001" } });

      // Only matching order should be visible
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
      expect(screen.queryByText("ORD-1002")).not.toBeInTheDocument();
      expect(screen.queryByText("ORD-1003")).not.toBeInTheDocument();
    });

    it("should filter orders by customer ID", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "CUST-002" } });

      expect(screen.getByText("ORD-1002")).toBeInTheDocument();
      expect(screen.queryByText("ORD-1001")).not.toBeInTheDocument();
      expect(screen.queryByText("ORD-1003")).not.toBeInTheDocument();
    });

    it("should filter orders by city", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "Алматы" } });

      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
      expect(screen.queryByText("ORD-1002")).not.toBeInTheDocument();
      expect(screen.queryByText("ORD-1003")).not.toBeInTheDocument();
    });

    it("should show no results message when search has no matches", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(
        screen.getByText("No orders found matching your search."),
      ).toBeInTheDocument();
    });
  });

  describe("Sorting Functionality", () => {
    it("should sort orders by date ascending", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("sort-date")).toBeInTheDocument();
      });

      // Click date sort button to get ascending order
      const sortButton = screen.getByTestId("sort-date");
      fireEvent.click(sortButton); // First click - asc

      // Check order of rows - should be chronological (using realistic IDs)
      const rows = screen.getAllByTestId(/^order-row-/);
      expect(rows[0]).toHaveAttribute("data-testid", "order-row-ORD-1002"); // 2024-01-10
      expect(rows[1]).toHaveAttribute("data-testid", "order-row-ORD-1001"); // 2024-01-15
      expect(rows[2]).toHaveAttribute("data-testid", "order-row-ORD-1003"); // 2024-01-20
    });

    it("should sort orders by total amount", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("sort-total")).toBeInTheDocument();
      });

      const sortButton = screen.getByTestId("sort-total");
      fireEvent.click(sortButton); // asc - lowest to highest

      const rows = screen.getAllByTestId(/^order-row-/);
      expect(rows[0]).toHaveAttribute("data-testid", "order-row-ORD-1002"); // 15000
      expect(rows[1]).toHaveAttribute("data-testid", "order-row-ORD-1001"); // 25000
      expect(rows[2]).toHaveAttribute("data-testid", "order-row-ORD-1003"); // 35000
    });

    it("should toggle sort direction when clicking same column", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("sort-total")).toBeInTheDocument();
      });

      const sortButton = screen.getByTestId("sort-total");

      // First click - ascending
      fireEvent.click(sortButton);
      let rows = screen.getAllByTestId(/^order-row-/);
      expect(rows[0]).toHaveAttribute("data-testid", "order-row-ORD-1002"); // 15000 (lowest)

      // Second click - descending
      fireEvent.click(sortButton);
      rows = screen.getAllByTestId(/^order-row-/);
      expect(rows[0]).toHaveAttribute("data-testid", "order-row-ORD-1003"); // 35000 (highest)
    });
  });

  describe("Row Selection", () => {
    it("should select individual orders", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("select-order-ORD-1001")).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId("select-order-ORD-1001");
      fireEvent.click(checkbox);

      expect(screen.getByTestId("bulk-actions")).toBeInTheDocument();
      expect(screen.getByText("1 выбрано")).toBeInTheDocument();
    });

    it("should select all orders", async () => {
      render(
        <TestWrapper>
          <OrdersPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("select-all-checkbox")).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getByTestId("select-all-checkbox");
      fireEvent.click(selectAllCheckbox);

      expect(screen.getByTestId("bulk-actions")).toBeInTheDocument();
      expect(screen.getByText("3 выбрано")).toBeInTheDocument();
    });
  });
});
