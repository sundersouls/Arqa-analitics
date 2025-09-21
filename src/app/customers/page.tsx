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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, User, MapPin, AlertCircle } from "lucide-react";
import {
  useCustomersQuery,
  useOrdersByCustomerIdQuery,
} from "@/lib/useQueries";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/useToast";
import { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: customers, isLoading, error, isError } = useCustomersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Customer>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: customerOrders } = useOrdersByCustomerIdQuery(
    selectedCustomer?.id || "",
  );

  if (isError && error) {
    toast.error("Failed to load customers", {
      description: error.message || "Please try again later",
    });
  }

  const cities = useMemo(() => {
    if (!customers) return [];
    return [...new Set(customers.map((customer) => customer.city))];
  }, [customers]);

  const filteredAndSortedCustomers = useMemo(() => {
    if (!customers) return [];

    const filtered = customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.id.toLowerCase().includes(searchLower);

      const cityMatch = !cityFilter || customer.city === cityFilter;

      return searchMatch && cityMatch;
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
  }, [customers, searchTerm, cityFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (
    customer: Customer,
    event:
      | React.MouseEvent<HTMLTableRowElement>
      | React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    setSelectedCustomer(customer);
    setIsDetailDialogOpen(true);
  };

  const formatCurrency = (amount: number) => `₸${amount.toLocaleString()}`;

  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="flex-1 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t("customers")}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {t("customersTable")}
        </p>
      </header>

      {isError && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load customers. Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle>{t("customersTable")}</CardTitle>
              <CardDescription>
                {t("customerName")}, {t("email")}, {t("city")}, {t("ltv")},{" "}
                {t("ordersCount")}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search
                  className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                <Input
                  placeholder={t("searchCustomers")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  aria-label="Search customers"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    aria-label="Filter by city"
                  >
                    <MapPin className="h-4 w-4" />
                    {cityFilter || t("city")}{" "}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{t("city")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCityFilter("")}>
                    {t("all")}
                  </DropdownMenuItem>
                  {cities.map((city) => (
                    <DropdownMenuItem
                      key={city}
                      onClick={() => setCityFilter(city)}
                    >
                      {city}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    aria-label="Sort options"
                  >
                    {t("sortBy")} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{t("sortBy")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSort("name")}>
                    {t("customerName")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("ltv")}>
                    {t("ltv")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("ordersCount")}>
                    {t("ordersCount")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("customerName")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("city")}</TableHead>
                    <TableHead>{t("ltv")}</TableHead>
                    <TableHead>{t("ordersCount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <LoadingSkeleton />
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("name")}
                        aria-label={`Sort by name ${sortField === "name" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                      >
                        {t("customerName")}
                        {sortField === "name" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("email")}
                        aria-label={`Sort by email ${sortField === "email" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                      >
                        {t("email")}
                        {sortField === "email" && (
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
                        onClick={() => handleSort("ltv")}
                        aria-label={`Sort by LTV ${sortField === "ltv" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                      >
                        {t("ltv")}
                        {sortField === "ltv" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-primary focus:outline-none focus:text-primary"
                        onClick={() => handleSort("ordersCount")}
                        aria-label={`Sort by orders count ${sortField === "ordersCount" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                      >
                        {t("ordersCount")}
                        {sortField === "ordersCount" && (
                          <span aria-hidden="true">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-gray-50 dark:focus-within:bg-gray-800"
                      onClick={(e) => handleRowClick(customer, e)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Customer ${customer.name}, click to view details`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(
                            customer,
                            e as React.KeyboardEvent<HTMLTableRowElement>,
                          );
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                          />
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(customer.ltv)}
                      </TableCell>
                      <TableCell>{customer.ordersCount}</TableCell>
                    </TableRow>
                  ))}
                  {filteredAndSortedCustomers.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        {searchTerm || cityFilter
                          ? "No customers found matching your criteria."
                          : "No customers available."}
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
          className="max-w-4xl"
          aria-describedby="customer-details-description"
        >
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("customerDetails")} - {selectedCustomer.name}
                </DialogTitle>
                <DialogDescription id="customer-details-description">
                  {selectedCustomer.email} | {selectedCustomer.city}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">{t("customerName")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedCustomer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("email")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedCustomer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("ltv")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatCurrency(selectedCustomer.ltv)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("ordersCount")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedCustomer.ordersCount}
                    </p>
                  </div>
                </div>

                {customerOrders && customerOrders.length > 0 ? (
                  <div>
                    <p className="text-lg font-medium mb-3">
                      {t("customerOrders")}
                    </p>
                    <div className="rounded-md border max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("orderId")}</TableHead>
                            <TableHead>{t("date")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                            <TableHead>{t("total")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.id}
                              </TableCell>
                              <TableCell>
                                {new Date(order.date).toLocaleDateString(
                                  "ru-RU",
                                )}
                              </TableCell>
                              <TableCell>{order.status}</TableCell>
                              <TableCell>
                                {formatCurrency(order.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No orders found for this customer.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
