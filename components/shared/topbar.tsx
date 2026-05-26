"use client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppSwitcher } from "./app-switcher";
import { ThemeToggle } from "@/components/theme-toggle";



export function Topbar() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
		return () => unsubscribe();
	}, []);

	const initials = user?.displayName
		? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
		: user?.email?.slice(0, 2).toUpperCase() ?? "?";

	async function handleSignOut() {
		await signOut(auth);
		document.cookie = "firebase-auth=; path=/; max-age=0";
		router.push("/iniciar-sesion");
	}

	return (
		<div className="flex h-16 items-center justify-between border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex-1" />

			{/* Right Section */}
			<div className="flex items-center gap-3">
				{/* App Switcher */}
				<AppSwitcher />

				{/* Theme Toggle */}
				<ThemeToggle />

				{/* Notifications */}
				<Button
					variant="ghost"
					size="icon"
					className="relative h-9 w-9 hover:bg-muted transition-colors"
					aria-label="Notificaciones"
				>
					<Bell className="h-4 w-4" />
					<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
						3
					</span>
				</Button>

				{/* Profile */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="relative h-9 w-9 rounded-full hover:bg-muted transition-colors"
						>
							<Avatar className="h-8 w-8 ring-2 ring-background">
								<AvatarImage src={user?.photoURL ?? "/avatar.png"} alt={user?.displayName ?? ""} />
								<AvatarFallback className="bg-primary text-primary-foreground font-semibold">
									{initials}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64 p-2" align="end" forceMount>
						<DropdownMenuLabel className="font-normal p-3">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10">
									<AvatarImage src={user?.photoURL ?? "/avatar.png"} alt={user?.displayName ?? ""} />
									<AvatarFallback className="bg-primary text-primary-foreground">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">{user?.displayName ?? "Usuario"}</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user?.email ?? ""}
									</p>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator className="my-2" />
						<DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-md transition-colors">
							<span className="flex items-center gap-2">👤 Perfil</span>
						</DropdownMenuItem>
						<DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-md transition-colors">
							<span className="flex items-center gap-2">⚙️ Configuración</span>
						</DropdownMenuItem>
						<DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-md transition-colors">
							<span className="flex items-center gap-2">💳 Facturación</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="my-2" />
						<DropdownMenuItem onClick={handleSignOut} className="p-3 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors">
							<span className="flex items-center gap-2">🚪 Cerrar sesión</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
