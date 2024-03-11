import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { UserMenu } from "~/components/user-menu";
import { sidebarLinks } from "~/data/navigation";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { MenuIcon } from "lucide-react";
import * as React from "react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="flex">
      <Sidebar />
      <div className="relative flex-grow space-y-4 px-4">
        <div className="flex items-center justify-between pt-3">
          <time className="text-muted-foreground">
            {format(new Date(), "PPPP")}
          </time>

          <UserMenu />
        </div>

        <Outlet />
      </div>
    </main>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.aside
      data-open={isOpen}
      initial={{
        width: 64,
      }}
      animate={{
        width: isOpen ? 240 : 64,
      }}
      className={cn(
        "group sticky top-0 h-screen flex-shrink-0 space-y-4 overflow-x-hidden bg-muted py-2",
      )}
    >
      <ScrollArea className="h-full">
        <div className="group-data-[open='true']:px-2">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start px-2 group-data-[open='false']:justify-center"
            onClick={() => setIsOpen((open) => !open)}
          >
            <MenuIcon className="size-5 flex-shrink-0 group-data-[open='true']:mr-2" />
            <div className="whitespace-pre group-data-[open='false']:w-0 group-data-[open='false']:overflow-visible group-data-[open='false']:opacity-0">
              <p className="text-2xl">tetoy</p>
            </div>
          </Button>
        </div>
        <Separator className="my-2 dark:bg-primary-foreground" />
        <SidebarLinks />
      </ScrollArea>
    </motion.aside>
  );
}

function SidebarLinks() {
  return (
    <ul className="flex flex-col justify-center space-y-1">
      {sidebarLinks.map((l) => (
        <li key={l.title} className="w-full px-3">
          <TooltipProvider key={l.title} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={l.to}
                  className="flex select-none items-center rounded-md p-2 group-data-[open='false']:justify-center [&:not([data-status])]:hover:bg-primary-foreground"
                  activeProps={{
                    className:
                      "bg-primary hover:bg-primary text-white hover:text-white",
                  }}
                >
                  <l.icon className="size-5 flex-shrink-0 group-data-[open='true']:mr-2" />
                  <div className="whitespace-pre group-data-[open='false']:w-0 group-data-[open='false']:overflow-visible group-data-[open='false']:opacity-0">
                    <span>{l.title}</span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>{l.title}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </li>
      ))}
    </ul>
  );
}
