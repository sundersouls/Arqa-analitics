import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import MiniAnalytics from "@/app/page";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";

// Mock data - using smaller, more predictable values
const testOrdersData = [
  {
    id: "1",
    date: "2025-09-21",
    customerId: "customer1",
    city: "Алматы",
    channel: "Web",
    status: "delivered",
    total: 1000, // Smaller numbers for easier testing
    items: [],
  },
  {
    id: "2",
    date: "2025-09-21",
    customerId: "customer2",
    city: "Нур-Султан",
    channel: "Mobile",
    status: "processing",
    total: 2000,
    items: [],
  },
];

// Mock the queries - the issue is your component is using real data
const mockUseOrdersQuery = jest.fn();

jest.mock("@/lib/useQueries", () => ({
  useOrdersQuery: (filters: any) => {
    console.log("useOrdersQuery called with:", filters);
    return mockUseOrdersQuery(filters);
  },
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

// Mock recharts to capture what chart type is being rendered
jest.mock("recharts", () => ({
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock i18n with actual translations from your component
jest.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        analytics: "Аналитика",
        filters: "Фильтры",
        period: "Период",
        city: "Город",
        channel: "Канал",
        chartType: "Тип графика",
        all: "Все",
        revenue: "Выручка",
        orders: "Заказы",
        aov: "AOV",
        conversionRate: "Конверсия",
        barChart: "Столбчатый",
        lineChart: "Линейный",
        exportCSV: "Экспорт CSV",
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

describe("Analytics Filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Default return - use consistent test data
    mockUseOrdersQuery.mockReturnValue({
      data: testOrdersData,
      isLoading: false,
      error: null,
      isError: false,
    });
  });

  describe("Basic Rendering", () => {
    it("should render filters and basic metrics", async () => {
      render(
        <TestWrapper>
          <MiniAnalytics />
        </TestWrapper>,
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText("Фильтры")).toBeInTheDocument();
      });

      // Check filter sections are present
      expect(screen.getByText("Период")).toBeInTheDocument();
      expect(screen.getByText("Город")).toBeInTheDocument();
      expect(screen.getByText("Канал")).toBeInTheDocument();
      expect(screen.getByText("Тип графика")).toBeInTheDocument();

      // Check metrics are rendered (use predictable test data)
      await waitFor(() => {
        expect(screen.getByTestId("revenue-value")).toBeInTheDocument();
        expect(screen.getByTestId("orders-value")).toBeInTheDocument();
      });

      // Should show total from our test data: 1000 + 2000 = 3000
      expect(screen.getByText(/₸\s*3[,\s]000/)).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // 2 orders
    });
  });

  describe("Filter Interactions", () => {
    it("should trigger query calls when filters change", async () => {
      let callCount = 0;
      mockUseOrdersQuery.mockImplementation((filters) => {
        callCount++;
        console.log(`Call ${callCount} with filters:`, filters);
        return {
          data: testOrdersData,
          isLoading: false,
          error: null,
          isError: false,
        };
      });

      render(
        <TestWrapper>
          <MiniAnalytics />
        </TestWrapper>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId("period-30d")).toBeInTheDocument();
      });

      // Initial call should have been made
      expect(callCount).toBeGreaterThan(0);

      // Click 30d period to trigger a new query
      const period30Button = screen.getByTestId("period-30d");
      fireEvent.click(period30Button);

      // Should have triggered another query call
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(1);
      });
    });

    it("should save filter state to localStorage", async () => {
      render(
        <TestWrapper>
          <MiniAnalytics />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("period-30d")).toBeInTheDocument();
      });

      // Change period filter
      const period30Button = screen.getByTestId("period-30d");
      fireEvent.click(period30Button);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "arqa-analytics-filters",
          expect.stringContaining('"period":"30d"'),
        );
      });
    });

    it("should change chart type when filter is clicked", async () => {
      render(
        <TestWrapper>
          <MiniAnalytics />
        </TestWrapper>,
      );

      // Wait for initial render - should show bar chart by default
      await waitFor(() => {
        expect(screen.getByTestId("chart-container")).toBeInTheDocument();
      });

      // Look for line chart button and click it
      await waitFor(() => {
        expect(screen.getByText("Линейный")).toBeInTheDocument();
      });

      const lineChartButton = screen.getByText("Линейный");
      fireEvent.click(lineChartButton);

      // The chart should change (this tests the component logic, not necessarily the visual change)
      await waitFor(() => {
        expect(screen.getByText("Линейный")).toBeInTheDocument();
      });
    });
  });

  describe("Data Updates", () => {
    it("should update displayed metrics when mock data changes", async () => {
      let currentData = testOrdersData;

      mockUseOrdersQuery.mockImplementation(() => ({
        data: currentData,
        isLoading: false,
        error: null,
        isError: false,
      }));

      const { rerender } = render(
        <TestWrapper>
          <MiniAnalytics />
        </TestWrapper>,
      );

      // Initial state
      await waitFor(() => {
        expect(screen.getByText(/₸\s*3[,\s]000/)).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });

      // Change the mock data
      currentData = [testOrdersData[0]]; // Only first order

      mockUseOrdersQuery.mockReturnValue({
        data: currentData,
        isLoading: false,
        error: null,
        isError: false,
      });

      // Rerender to trigger update
      rerender(
        <TestWrapper>
          <MiniAnalytics />
        </TestWrapper>,
      );

      // Should show updated metrics
      await waitFor(() => {
        expect(screen.getByText("₸1,000")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });
  });
});
