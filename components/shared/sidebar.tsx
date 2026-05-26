"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Settings,
	Users,
	BarChart3,
	ChevronLeft,
	ChevronRight,
	Database,
	HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarGroups = [
	{
		title: "General",
		items: [
			{
				title: "Desempeño",
				href: "/dashboard",
				icon: LayoutDashboard,
				badge: null,
			},
		],
	},
	{
		title: "Reportes",
		items: [
			{
				title: "Analítica",
				href: "/dashboard/analitica",
				icon: BarChart3,
				badge: null,
			},
			{
				title: "Dashboard Operativo",
				href: "/dashboard/operativo",
				icon: BarChart3,
				badge: null,
			},
		],
	},
	{
		title: "Administración",
		items: [
			{
				title: "Configuración",
				href: "/dashboard/configuracion",
				icon: Settings,
				badge: null,
			},
			{
				title: "Usuarios",
				href: "/dashboard/usuarios",
				icon: Users,
				badge: "12",
			},
			{
				title: "Ayuda",
				href: "/dashboard/ayuda",
				icon: HelpCircle,
				badge: null,
			},
			{
				title: "Configuración sistema",
				href: "https://airtable.com/",
				icon: Database,
				badge: null,
				external: true,
			},
		],
	},
];

interface SidebarProps {
	onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
	const pathname = usePathname();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleLinkClick = () => {
		if (onMobileClose) {
			onMobileClose();
		}
	};

	return (
		<div
			className={cn(
				"flex h-full flex-col border-r bg-card shadow-sm transition-all duration-300",
				isCollapsed ? "w-16" : "w-72",
			)}
		>
			{/* Logo */}
			<div className="flex h-16 items-center justify-between border-b px-6">
				{!isCollapsed && (
					<Link href="/dashboard" className="group flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<LayoutDashboard className="h-4 w-4 text-primary-foreground" />
						</div>
						<div className="flex flex-col">
							<span className="text-xl font-bold leading-tight transition-colors group-hover:text-primary">
								QIA
							</span>
							<span className="text-[10px] leading-tight text-muted-foreground">
								Quality Intelligence Analytics
							</span>
						</div>
					</Link>
				)}

				{isCollapsed && (
					<div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<LayoutDashboard className="h-4 w-4 text-primary-foreground" />
					</div>
				)}

				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 hover:bg-muted"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Navigation Groups */}
			<nav className="flex-1 space-y-8 p-6">
				{sidebarGroups.map((group) => (
					<div key={group.title} className="space-y-3">
						{!isCollapsed && (
							<h3 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								{group.title}
							</h3>
						)}

						<div className="space-y-2">
							{group.items.map((item) => {
								const isActive = !item.external && pathname === item.href;
								const Icon = item.icon;

								return (
									<Link
										key={item.href}
										href={item.href}
										target={item.external ? "_blank" : undefined}
										rel={item.external ? "noopener noreferrer" : undefined}
										onClick={handleLinkClick}
										className={cn(
											"group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted",
											isActive
												? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
												: "text-muted-foreground hover:text-foreground",
											isCollapsed && "justify-center px-3 py-4",
										)}
										title={isCollapsed ? item.title : undefined}
									>
										<Icon
											className={cn(
												"transition-all duration-200",
												isCollapsed ? "h-5 w-5" : "h-4 w-4",
												isActive && !isCollapsed && "text-primary-foreground",
											)}
										/>

										{!isCollapsed && (
											<>
												<span className="transition-transform duration-200 group-hover:translate-x-0.5">
													{item.title}
												</span>

												{item.badge && (
													<span
														className={cn(
															"ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
															isActive
																? "bg-primary-foreground/20 text-primary-foreground"
																: "bg-muted text-muted-foreground",
														)}
													>
														{item.badge}
													</span>
												)}
											</>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>
		</div>
	);
}
