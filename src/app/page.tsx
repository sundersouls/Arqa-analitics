"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { LoadingSpinner } from "@/components/spinner";
import {
  DollarSign,
  ShoppingCart,
  BarChart3,
  Percent,
  Download,
} from "lucide-react";
import { useOrdersQuery, FilterParams } from "@/lib/useQueries";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/useToast";
import { Order } from "@/lib/types";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MiniAnalytics() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterParams>({ period: "7d" });
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    const savedFilters = localStorage.getItem("arqa-analytics-filters");
    const savedChartType = localStorage.getItem("arqa-chart-type");

    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error("Failed to parse saved filters:", error);
      }
    }

    if (savedChartType) {
      setChartType(savedChartType);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("arqa-analytics-filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("arqa-chart-type", chartType);
  }, [chartType]);

  const { data: orders, isLoading, error, isError } = useOrdersQuery(filters);

  if (isError && error) {
    toast.error("Failed to load data", {
      description: error.message || "Please try again later",
    });
  }

  const revenue = orders
    ? orders.reduce((sum: number, order: Order) => sum + order.total, 0)
    : 0;
  const ordersCount = orders ? orders.length : 0;
  const aov = ordersCount > 0 ? revenue / ordersCount : 0;

  const chartData = useMemo(() => {
    if (!orders) return [];

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
  }, [orders]);

  const formatCurrency = (amount: number) => `₸${amount.toLocaleString()}`;
  const formatNumber = (num: number) => num.toLocaleString();

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const csvContent = [
        "date,revenue,orders",
        ...orders.map((order: Order) => `${order.date},${order.total},1`),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "arqa-analytics-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      toast.error(`Failed to export data: ${error}`, {
        description: "Please try again later",
      });
    }
  };

  const applyFilters = (
    newPeriod: string,
    newCity: string,
    newChannel: string,
    newChartType: string,
  ) => {
    setFilters({
      period: newPeriod,
      city: newCity || undefined,
      channel: newChannel || undefined,
    });
    setChartType(newChartType);
  };

  return (
    <div className="flex-1 p-6" data-testid="analytics-page">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("analytics")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Обзор ключевых метрик за выбранный период
            </p>
          </div>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex gap-2 items-center focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={isLoading || !orders?.length}
            aria-label={`${t("exportCSV")} - ${orders?.length || 0} records available`}
            data-testid="export-csv-button"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{t("exportCSV")}</span>
          </Button>
        </div>

        <section aria-label="Data filters">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("filters")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <fieldset>
                  <legend className="text-sm font-medium mb-2">
                    {t("period")}
                  </legend>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Period selection"
                    data-testid="period-filters"
                  >
                    {["7d", "30d", "QTD", "YTD"].map((period) => (
                      <Button
                        key={period}
                        size="sm"
                        variant={
                          filters.period === period ? "default" : "outline"
                        }
                        onClick={() =>
                          applyFilters(
                            period,
                            filters.city || "",
                            filters.channel || "",
                            chartType,
                          )
                        }
                        aria-pressed={filters.period === period}
                        className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        data-testid={`period-${period}`}
                      >
                        {period === "7d"
                          ? "7 дн."
                          : period === "30d"
                            ? "30 дн."
                            : period}
                      </Button>
                    ))}
                  </div>
                </fieldset>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <fieldset>
                    <legend className="text-sm font-medium mb-2">
                      {t("city")}
                    </legend>
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="City selection"
                      data-testid="city-filters"
                    >
                      {[
                        { value: "", label: t("all") },
                        { value: "Алматы", label: "Алматы" },
                        { value: "Нур-Султан", label: "Нур-Султан" },
                        { value: "Шымкент", label: "Шымкент" },
                      ].map(({ value, label }) => (
                        <Button
                          key={value || "all"}
                          size="sm"
                          variant={
                            filters.city === value || (!filters.city && !value)
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            applyFilters(
                              filters.period || "7d",
                              value,
                              filters.channel || "",
                              chartType,
                            )
                          }
                          aria-pressed={
                            filters.city === value || (!filters.city && !value)
                          }
                          className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          data-testid={`city-${value || "all"}`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-medium mb-2">
                      {t("channel")}
                    </legend>
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="Channel selection"
                      data-testid="channel-filters"
                    >
                      {[
                        { value: "", label: t("all") },
                        { value: "Web", label: "Web" },
                        { value: "Mobile", label: "Mobile" },
                      ].map(({ value, label }) => (
                        <Button
                          key={value || "all"}
                          size="sm"
                          variant={
                            filters.channel === value ||
                            (!filters.channel && !value)
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            applyFilters(
                              filters.period || "7d",
                              filters.city || "",
                              value,
                              chartType,
                            )
                          }
                          aria-pressed={
                            filters.channel === value ||
                            (!filters.channel && !value)
                          }
                          className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          data-testid={`channel-${value || "all"}`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-medium mb-2">
                      {t("chartType")}
                    </legend>
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="Chart type selection"
                      data-testid="chart-type-filters"
                    >
                      {[
                        { value: "bar", label: t("barChart") },
                        { value: "line", label: t("lineChart") },
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          size="sm"
                          variant={chartType === value ? "default" : "outline"}
                          onClick={() =>
                            applyFilters(
                              filters.period || "7d",
                              filters.city || "",
                              filters.channel || "",
                              value,
                            )
                          }
                          aria-pressed={chartType === value}
                          className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          data-testid={`chart-type-${value}`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </header>

      <section aria-label="Key metrics">
        <h2 className="sr-only">Key Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card data-testid="revenue-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4" aria-hidden="true" />
                {t("revenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div
                  className="text-2xl font-bold text-green-600 dark:text-green-400"
                  aria-label={`Revenue: ${formatCurrency(revenue)}`}
                  data-testid="revenue-value"
                >
                  {formatCurrency(revenue)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="orders-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {t("orders")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                  aria-label={`Orders: ${formatNumber(ordersCount)}`}
                  data-testid="orders-value"
                >
                  {formatNumber(ordersCount)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="aov-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                {t("aov")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div
                  className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                  aria-label={`Average order value: ${formatCurrency(Math.round(aov))}`}
                  data-testid="aov-value"
                >
                  {formatCurrency(Math.round(aov))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="conversion-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Percent className="h-4 w-4" aria-hidden="true" />
                {t("conversionRate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                aria-label="Conversion rate: Not available"
                data-testid="conversion-value"
              >
                -
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-label="Revenue chart">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("revenue")} Over Time</CardTitle>
            <CardDescription>
              Revenue breakdown for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="h-[300px] w-full"
              role="img"
              aria-label={`${chartType} chart showing revenue over time`}
              data-testid="chart-container"
            >
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-2">Loading chart data...</span>
                </div>
              ) : isError ? (
                <div className="h-full flex items-center justify-center text-destructive">
                  <p>Failed to load chart data. Please try again.</p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>No data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      data-testid="bar-chart"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `₸${Number(value).toLocaleString()}`,
                          t("revenue"),
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        name={t("revenue")}
                      />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      data-testid="line-chart"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `₸${Number(value).toLocaleString()}`,
                          t("revenue"),
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        name={t("revenue")}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
