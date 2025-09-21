"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, Edit, AlertCircle } from "lucide-react";
import { useAllOrdersQuery } from "@/lib/useQueries";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/useToast";
import { Order } from "@/lib/types";

export default function OrdersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: orders, isLoading, error, isError } = useAllOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Order>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  if (isError && error) {
    toast.error("Failed to load orders", {
      description: error.message || "Please try again later",
    });
  }

  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    const filtered = orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.customerId.toLowerCase().includes(searchLower) ||
        order.city.toLowerCase().includes(searchLower) ||
        order.channel.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [orders, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredAndSortedOrders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleBulkStatusChange = () => {
    if (selectedOrders.length === 0) {
      toast.error("No orders selected");
      return;
    }
    setIsStatusDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (newStatus && selectedOrders.length > 0) {
      toast.success(
        `Status changed to ${newStatus} for ${selectedOrders.length} orders`,
      );
      setSelectedOrders([]);
      setIsStatusDialogOpen(false);
      setNewStatus("");
    }
  };

  const handleRowClick = (
    order: Order,
    event:
      | React.MouseEvent<HTMLTableRowElement>
      | React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest("button")
    ) {
      return;
    }
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      new: { variant: "secondary" as const, text: t("new") },
      processing: { variant: "default" as const, text: t("processing") },
      shipped: { variant: "outline" as const, text: t("shipped") },
      delivered: { variant: "default" as const, text: t("delivered") },
      cancelled: { variant: "destructive" as const, text: t("cancelled") },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: "secondary" as const,
      text: status,
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatCurrency = (amount: number) => `₸${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const allSelected =
    selectedOrders.length === filteredAndSortedOrders.length &&
    filteredAndSortedOrders.length > 0;

  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="flex-1 p-6" data-testid="orders-page">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t("orders")}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {t("ordersTable")}
        </p>
      </header>

      {isError && (
        <Card className="mb-6 border-destructive" data-testid="error-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load orders. Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>{t("ordersTable")}</CardTitle>
              <CardDescription>
                {t("orderId")}, {t("date")}, {t("customer")}, {t("city")},{" "}
                {t("channel")}, {t("status")}, {t("total")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search
                  className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  aria-label="Search orders"
                  data-testid="search-input"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    aria-label="Sort options"
                    data-testid="sort-dropdown"
                  >
                    {t("sortBy")} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{t("sortBy")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSort("date")}>
                    {t("date")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("total")}>
                    {t("total")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("status")}>
                    {t("status")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("city")}>
                    {t("city")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {selectedOrders.length > 0 && (
            <div
              className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
              role="alert"
              data-testid="bulk-actions"
            >
              <span className="text-sm font-medium">
                {selectedOrders.length} {t("selectedItems")}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkStatusChange}
                className="flex items-center gap-2"
                aria-label={`Change status for ${selectedOrders.length} selected orders`}
                data-testid="bulk-change-status"
              >
                <Edit className="h-4 w-4" />
                {t("changeStatus")}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="rounded-md border" data-testid="loading-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Skeleton className="h-4 w-4" />
                    </TableHead>
                    <TableHead>{t("orderId")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("customer")}</TableHead>
                    <TableHead>{t("city")}</TableHead>
                    <TableHead>{t("channel")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <LoadingSkeleton />
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border" data-testid="orders-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label={
                          allSelected
                            ? "Deselect all orders"
                            : "Select all orders"
                        }
                        data-testid="select-all-checkbox"
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("id")}
                        aria-label={`Sort by order ID ${sortField === "id" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-id"
                      >
                        {t("orderId")}
                        {sortField === "id" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("date")}
                        aria-label={`Sort by date ${sortField === "date" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-date"
                      >
                        {t("date")}
                        {sortField === "date" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("customerId")}
                        aria-label={`Sort by customer ${sortField === "customerId" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-customer"
                      >
                        {t("customer")}
                        {sortField === "customerId" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("city")}
                        aria-label={`Sort by city ${sortField === "city" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-city"
                      >
                        {t("city")}
                        {sortField === "city" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("channel")}
                        aria-label={`Sort by channel ${sortField === "channel" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-channel"
                      >
                        {t("channel")}
                        {sortField === "channel" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("status")}
                        aria-label={`Sort by status ${sortField === "status" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-status"
                      >
                        {t("status")}
                        {sortField === "status" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("total")}
                        aria-label={`Sort by total ${sortField === "total" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                        data-testid="sort-total"
                      >
                        {t("total")}
                        {sortField === "total" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-gray-50 dark:focus-within:bg-gray-800"
                      onClick={(e) => handleRowClick(order, e)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Order ${order.id}, click to view details`}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLTableRowElement>,
                      ) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(order, e);
                        }
                      }}
                      data-testid={`order-row-${order.id}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOrder(order.id, !!checked)
                          }
                          aria-label={`Select order ${order.id}`}
                          data-testid={`select-order-${order.id}`}
                        />
                      </TableCell>
                      <TableCell
                        className="font-medium"
                        data-testid={`order-id-${order.id}`}
                      >
                        {order.id}
                      </TableCell>
                      <TableCell data-testid={`order-date-${order.id}`}>
                        {formatDate(order.date)}
                      </TableCell>
                      <TableCell data-testid={`order-customer-${order.id}`}>
                        {order.customerId}
                      </TableCell>
                      <TableCell data-testid={`order-city-${order.id}`}>
                        {order.city}
                      </TableCell>
                      <TableCell data-testid={`order-channel-${order.id}`}>
                        {order.channel}
                      </TableCell>
                      <TableCell data-testid={`order-status-${order.id}`}>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell
                        className="font-medium"
                        data-testid={`order-total-${order.id}`}
                      >
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAndSortedOrders.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-10 text-muted-foreground"
                        data-testid="no-orders-message"
                      >
                        {searchTerm
                          ? "No orders found matching your search."
                          : "No orders available."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent
          className="max-w-2xl"
          aria-describedby="order-details-description"
          data-testid="order-details-dialog"
        >
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle data-testid="order-details-title">
                  {t("orderDetails")} #{selectedOrder.id}
                </DialogTitle>
                <DialogDescription
                  id="order-details-description"
                  data-testid="order-details-description"
                >
                  {t("date")}: {formatDate(selectedOrder.date)} | {t("status")}:{" "}
                  {selectedOrder.status}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">{t("customer")}</p>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-300"
                      data-testid="order-details-customer"
                    >
                      {selectedOrder.customerId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("city")}</p>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-300"
                      data-testid="order-details-city"
                    >
                      {selectedOrder.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("channel")}</p>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-300"
                      data-testid="order-details-channel"
                    >
                      {selectedOrder.channel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("total")}</p>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-300"
                      data-testid="order-details-total"
                    >
                      {formatCurrency(selectedOrder.total)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">{t("orderItems")}</p>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody data-testid="order-items-table">
                        {selectedOrder.items.map((item, index) => (
                          <TableRow
                            key={index}
                            data-testid={`order-item-${index}`}
                          >
                            <TableCell data-testid={`item-sku-${index}`}>
                              {item.sku}
                            </TableCell>
                            <TableCell data-testid={`item-name-${index}`}>
                              {item.name}
                            </TableCell>
                            <TableCell data-testid={`item-qty-${index}`}>
                              {item.qty}
                            </TableCell>
                            <TableCell data-testid={`item-price-${index}`}>
                              {formatCurrency(item.price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedOrder.comment && (
                  <div>
                    <p className="text-sm font-medium">{t("comment")}</p>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-300"
                      data-testid="order-details-comment"
                    >
                      {selectedOrder.comment}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent
          aria-describedby="status-change-description"
          data-testid="status-change-dialog"
        >
          <DialogHeader>
            <DialogTitle data-testid="status-change-title">
              {t("changeStatus")}
            </DialogTitle>
            <DialogDescription
              id="status-change-description"
              data-testid="status-change-description"
            >
              Change status for {selectedOrders.length} selected orders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="status-select" className="text-sm font-medium">
                Select new status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger
                  id="status-select"
                  aria-label="Select new status"
                  data-testid="status-select"
                >
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent data-testid="status-select-content">
                  <SelectItem value="new" data-testid="status-new">
                    {t("new")}
                  </SelectItem>
                  <SelectItem
                    value="processing"
                    data-testid="status-processing"
                  >
                    {t("processing")}
                  </SelectItem>
                  <SelectItem value="shipped" data-testid="status-shipped">
                    {t("shipped")}
                  </SelectItem>
                  <SelectItem value="delivered" data-testid="status-delivered">
                    {t("delivered")}
                  </SelectItem>
                  <SelectItem value="cancelled" data-testid="status-cancelled">
                    {t("cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
                data-testid="cancel-status-change"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStatusChange}
                disabled={!newStatus}
                aria-label={`Confirm status change to ${newStatus} for ${selectedOrders.length} orders`}
                data-testid="confirm-status-change"
              >
                {t("changeStatus")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
