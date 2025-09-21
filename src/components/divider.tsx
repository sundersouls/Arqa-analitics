import * as React from "react";
import { cn } from "@/lib/utils";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Divider({
  orientation = "horizontal",
  className,
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "min-h-max w-0.5 bg-gray-200 dark:bg-gray-800",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "min-w-max h-0.5 bg-gray-200 dark:bg-gray-800 my-4",
        className,
      )}
    />
  );
}
