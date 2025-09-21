"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  return (
    <div className="md:flex">
      <aside className="hidden md:block w-60 bg-gray-900 text-white min-h-screen p-4">
        <h1 className="text-xl font-bold mb-6">ARQA Mini Analytics</h1>
        <NavigationMenu orientation="vertical">
          <NavigationMenuList className="flex-col space-y-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className="block rounded-lg px-3 w-58 py-2 hover:bg-gray-800"
                >
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/orders"
                  className="block rounded-lg px-3 w-58 py-2 hover:bg-gray-800"
                >
                  Orders
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/customers"
                  className="block rounded-lg px-3 w-58 py-2 hover:bg-gray-800"
                >
                  Customers
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/settings"
                  className="block rounded-lg px-3 w-58 py-2 hover:bg-gray-800"
                >
                  Settings
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </aside>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className="p-2">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-900 text-white w-64">
            <h1 className="text-xl font-bold mb-6">My App</h1>
            <NavigationMenu orientation="vertical">
              <NavigationMenuList className="flex-col space-y-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className="block rounded-lg px-3 py-2 hover:bg-gray-800"
                    >
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/profile"
                      className="block rounded-lg px-3 py-2 hover:bg-gray-800"
                    >
                      Profile
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/customers"
                      className="block rounded-lg px-3 py-2 hover:bg-gray-800"
                    >
                      Customers
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/settings"
                      className="block rounded-lg px-3 py-2 hover:bg-gray-800"
                    >
                      Settings
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
