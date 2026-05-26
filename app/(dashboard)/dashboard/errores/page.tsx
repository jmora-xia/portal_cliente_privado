import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	AlertTriangle,
	Search,
	Server,
	Shield,
	Lock,
	Wrench,
	ArrowRight,
} from "lucide-react";

const errorPages = [
	{
		title: "404 No encontrado",
		description:
			"Se muestra automáticamente cuando un usuario intenta acceder a una página inexistente",
		href: "/error/404",
		status: "Listo",
		icon: Search,
		color: "text-gray-500",
		bgColor: "bg-gray-100",
	},
	{
		title: "401 No autorizado",
		description: "Requiere autenticación cuando el usuario necesita iniciar sesión",
		href: "/error/401",
		status: "Listo",
		icon: Shield,
		color: "text-yellow-600",
		bgColor: "bg-yellow-100",
	},
	{
		title: "403 Prohibido",
		description: "Acceso denegado cuando el usuario no tiene permisos",
		href: "/error/403",
		status: "Listo",
		icon: Lock,
		color: "text-red-500",
		bgColor: "bg-red-100",
	},
	{
		title: "500 Error del servidor",
		description: "Error del servidor con diseño propio y opciones de soporte",
		href: "/error/500",
		status: "Listo",
		icon: Server,
		color: "text-red-500",
		bgColor: "bg-red-100",
	},
	{
		title: "Mantenimiento",
		description: "Mantenimiento programado con información de indisponibilidad",
		href: "/error/mantenimiento",
		status: "Listo",
		icon: Wrench,
		color: "text-blue-600",
		bgColor: "bg-blue-100",
	},
	{
		title: "Error genérico",
		description: "Página de error general para errores inesperados del cliente",
		href: "/dashboard/errores",
		status: "Listo",
		icon: AlertTriangle,
		color: "text-red-500",
		bgColor: "bg-red-100",
		note: "Se activa automáticamente por los límites de error de React",
	},
];

export default function ErrorsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Páginas de error</h1>
				<p className="text-muted-foreground">
					Colección de páginas de error diseñadas para distintos escenarios.
					Cada página tiene su propio estilo y propósito.
				</p>
			</div>

			<Separator />

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{errorPages.map((page) => {
					const IconComponent = page.icon;
					return (
						<Card key={page.title} className="group">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div
										className={`flex h-12 w-12 items-center justify-center rounded-lg ${page.bgColor}`}
									>
										<IconComponent className={`h-6 w-6 ${page.color}`} />
									</div>
									<Badge
										variant={page.status === "Listo" ? "default" : "secondary"}
									>
										{page.status}
									</Badge>
								</div>
								<CardTitle className="mt-4 text-lg">{page.title}</CardTitle>
								<CardDescription className="text-sm">
									{page.description}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{page.note && (
										<p className="text-xs text-muted-foreground bg-muted p-2 rounded">
											{page.note}
										</p>
									)}
									{page.href !== "/dashboard/errors" ? (
										<Button asChild className="w-full" variant="outline">
											<Link href={page.href}>
												<ArrowRight className="mr-2 h-4 w-4" />
												Ver página de error
											</Link>
										</Button>
									) : (
										<p className="text-xs text-muted-foreground text-center">
											Automático - no requiere prueba manual
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Separator />
		</div>
	);
}
