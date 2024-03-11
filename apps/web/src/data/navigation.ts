import type { RegisteredRouterPaths } from "~/types";
import {
  DatabaseIcon,
  LayoutDashboardIcon,
  PackageOpenIcon,
  TagsIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SidebarPaths = Extract<
  RegisteredRouterPaths,
  "/" | "/categories" | "/products" | "/storages"
>;

type SidebarLink = {
  title: string;
  icon: LucideIcon;
  to: SidebarPaths;
};

export const sidebarLinks = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    to: "/",
  },
  {
    title: "Storages",
    icon: DatabaseIcon,
    to: "/storages",
  },
  {
    title: "Products",
    icon: PackageOpenIcon,
    to: "/products",
  },
  {
    title: "Categories",
    icon: TagsIcon,
    to: "/categories",
  },
] satisfies SidebarLink[];
