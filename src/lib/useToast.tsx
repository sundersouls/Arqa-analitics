"use client";

import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  const toast = {
    success: (message: string, options?: { description?: string }) => {
      sonnerToast.success(message, options);
    },
    error: (message: string, options?: { description?: string }) => {
      sonnerToast.error(message, options);
    },
    info: (message: string, options?: { description?: string }) => {
      sonnerToast.info(message, options);
    },
    warning: (message: string, options?: { description?: string }) => {
      sonnerToast.warning(message, options);
    },
    loading: (message: string, options?: { description?: string }) => {
      sonnerToast.loading(message, options);
    },
  };

  return { toast };
};
