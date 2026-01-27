"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import {
  AppWindow,
  Brain,
  Briefcase,
  FolderOpenDot,
  Globe,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

function MenuItem({
  href,
  icon,
  iconClassName = "size-4 text-primary group-hover/link:text-brand",
  text,
  onClick,
  className,
}: {
  href: string;
  icon: React.ReactNode;
  iconClassName?: string;
  text: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  // Clone the icon element and add the className prop
  const iconWithClassName =
    icon && typeof icon === "object" && "type" in icon
      ? React.cloneElement(icon as React.ReactElement<any>, {
          className: cn(
            (icon as React.ReactElement<any>).props.className,
            iconClassName,
          ),
        })
      : icon;

  return (
    <li className={className}>
      <NavigationMenuLink className="group/link h-full" asChild>
        <Link
          href={href}
          onClick={onClick}
          className="flex flex-row items-center gap-2"
        >
          {iconWithClassName}
          {text}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center">
      <NavigationMenu>
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link className={navigationMenuTriggerStyle()} href="/">
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <ModeToggle />
    </header>
  );
}
