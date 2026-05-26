"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogIn, UserPlus, Lock, Mail, Shield, Key } from "lucide-react";
import Link from "next/link";

const authPages = [
	{
		title: "Ingreso",
		description: "Formulario clásico de ingreso con correo y contraseña.",
		icon: LogIn,
		href: "/iniciar-sesion",
		status: "Listo",
	},
	{
		title: "Registro",
		description: "Formulario de registro para crear nuevos usuarios.",
		icon: UserPlus,
		href: "/registro",
		status: "Listo",
	},
	{
		title: "Recuperar contraseña",
		description: "Formulario para restablecer la contraseña por correo.",
		icon: Lock,
		href: "/recuperar-contrasena",
		status: "Listo",
	},
	{
		title: "Verificación de correo",
		description:
			"Página para indicar al usuario que revise su correo y use el enlace de verificación.",
		icon: Mail,
		href: "/verificar-correo",
		status: "Listo",
	},
	{
		title: "Autenticación 2FA",
		description: "Página para configurar la autenticación de dos factores.",
		icon: Shield,
		href: "/configurar-2fa",
		status: "Listo",
	},
	{
		title: "Claves API",
		description: "Página para gestionar claves API de aplicaciones y servicios.",
		icon: Key,
		href: "/dashboard/configuracion/claves-api",
		status: "Listo",
	},
];

export default function AuthPage() {
	return (
		<div className="space-y-4">
			<div className="text-center">
				<h1 className="text-3xl font-bold">Páginas de autenticación</h1>
				<p className="text-muted-foreground">
					Aquí están las páginas relacionadas con autenticación. Ahora usan su
					propio layout de pantalla completa.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{authPages.map((page) => (
					<Link href={page.href} key={page.title}>
						<Card className="flex h-full transform flex-col transition-transform duration-300 hover:scale-105">
							<CardHeader>
								<div className="mb-2 flex justify-between">
									<CardTitle>{page.title}</CardTitle>
									<Badge
										variant={page.status === "Listo" ? "default" : "secondary"}
									>
										{page.status}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									{page.description}
								</p>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
