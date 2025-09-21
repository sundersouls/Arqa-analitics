"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

type Locale = "ru" | "en";

const translations = {
  ru: {
    settings: "Настройки",
    settingsDescription: "Настройте приложение по своему усмотрению",
    appearance: "Внешний вид",
    appearanceDescription: "Настройте тему приложения",
    darkMode: "Темная тема",
    darkModeDescription: "Переключение между светлой и темной темой",
    language: "Язык",
    languageDescription: "Выберите предпочтительный язык интерфейса",
    toggleLanguage: "Переключение между русским и английским языками",
    themeChanged: "Тема изменена",
    darkThemeEnabled: "Темная тема включена",
    lightThemeEnabled: "Светлая тема включена",
    languageChanged: "Язык изменен",
    englishEnabled: "English language enabled",
    russianEnabled: "Русский язык включен",
    analytics: "Аналитика",
    revenue: "Выручка",
    orders: "Заказы",
    aov: "Средний чек",
    conversionRate: "Конверсия",
    period: "Период",
    city: "Город",
    channel: "Канал",
    chartType: "Тип графика",
    barChart: "Столбчатый",
    lineChart: "Линейный",
    exportCSV: "Экспорт CSV",
    filters: "Фильтры",
    ordersTable: "Таблица заказов",
    orderId: "ID заказа",
    date: "Дата",
    customer: "Клиент",
    status: "Статус",
    total: "Сумма",
    search: "Поиск",
    searchPlaceholder: "Поиск по заказам...",
    sortBy: "Сортировать по",
    actions: "Действия",
    viewDetails: "Детали",
    orderDetails: "Детали заказа",
    orderItems: "Состав заказа",
    comment: "Комментарий",
    noComment: "Комментарий отсутствует",
    new: "Новый",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
    changeStatus: "Изменить статус",
    bulkActions: "Массовые действия",
    selectAll: "Выбрать все",
    selectedItems: "Выбрано элементов",
    customers: "Клиенты",
    customersTable: "Справочник клиентов",
    customerName: "Имя",
    email: "Email",
    ltv: "LTV",
    ordersCount: "Количество заказов",
    customerDetails: "Детали клиента",
    customerOrders: "Заказы клиента",
    searchCustomers: "Поиск клиентов...",
    all: "Все",
  },
  en: {
    settings: "Settings",
    settingsDescription: "Customize your application preferences",
    appearance: "Appearance",
    appearanceDescription: "Customize the application theme",
    darkMode: "Dark Mode",
    darkModeDescription: "Toggle between light and dark themes",
    language: "Language",
    languageDescription: "Select your preferred interface language",
    toggleLanguage: "Toggle between Russian and English languages",
    themeChanged: "Theme Changed",
    darkThemeEnabled: "Dark theme enabled",
    lightThemeEnabled: "Light theme enabled",
    languageChanged: "Language Changed",
    englishEnabled: "English language enabled",
    russianEnabled: "Russian language enabled",
    analytics: "Analytics",
    revenue: "Revenue",
    orders: "Orders",
    aov: "Average Order Value",
    conversionRate: "Conversion Rate",
    period: "Period",
    city: "City",
    channel: "Channel",
    chartType: "Chart Type",
    barChart: "Bar Chart",
    lineChart: "Line Chart",
    exportCSV: "Export CSV",
    filters: "Filters",
    ordersTable: "Orders Table",
    orderId: "Order ID",
    date: "Date",
    customer: "Customer",
    status: "Status",
    total: "Total",
    search: "Search",
    searchPlaceholder: "Search orders...",
    sortBy: "Sort by",
    actions: "Actions",
    viewDetails: "View Details",
    orderDetails: "Order Details",
    orderItems: "Order Items",
    comment: "Comment",
    noComment: "No comment",
    new: "New",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    changeStatus: "Change Status",
    bulkActions: "Bulk Actions",
    selectAll: "Select All",
    selectedItems: "Selected Items",
    customers: "Customers",
    customersTable: "Customers Directory",
    customerName: "Name",
    email: "Email",
    ltv: "LTV",
    ordersCount: "Orders Count",
    customerDetails: "Customer Details",
    customerOrders: "Customer Orders",
    searchCustomers: "Search customers...",
    all: "All",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    const savedLocale = localStorage.getItem("arqa-locale") as Locale;
    if (savedLocale && (savedLocale === "ru" || savedLocale === "en")) {
      setLocale(savedLocale);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("arqa-locale", newLocale);
  };

  const t = (key: string): string => {
    return (
      translations[locale][key as keyof (typeof translations)[typeof locale]] ||
      key
    );
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
