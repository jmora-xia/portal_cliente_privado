"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	HelpCircle,
	MessageCircle,
	Mail,
	Phone,
	BookOpen,
	Video,
	FileText,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
import { useState } from "react";

const faqs = [
	{
		question: "¿Cómo restablezco mi contraseña?",
		answer:
			"Puedes restablecer tu contraseña haciendo clic en el enlace de recuperación en la página de ingreso. Recibirás un correo con instrucciones para crear una nueva contraseña.",
		category: "Cuenta",
	},
	{
		question: "¿Cómo activo la autenticación de dos factores?",
		answer:
			"Ve a Configuración > Seguridad y activa la autenticación de dos factores. Deberás escanear un código QR con tu aplicación de autenticación para completar la configuración.",
		category: "Seguridad",
	},
	{
		question: "¿Cómo exporto mis datos?",
		answer:
			"Ve a Configuración > Gestión de datos y haz clic en Exportar datos. Tus datos se descargarán en formato JSON.",
		category: "Datos",
	},
	{
		question: "¿Cómo invito miembros del equipo?",
		answer:
			"Ve a la página de Usuarios y haz clic en Agregar usuario. Ingresa su correo y asigna el rol correspondiente.",
		category: "Equipo",
	},
	{
		question: "¿Cómo creo un nuevo proyecto?",
		answer:
			"En la página de Proyectos, haz clic en Nuevo proyecto y completa la información requerida.",
		category: "Proyectos",
	},
	{
		question: "¿Cómo programo una reunión?",
		answer:
			"Ve al Calendario y haz clic en Nuevo evento. Completa los detalles de la reunión.",
		category: "Calendario",
	},
];

const supportChannels = [
	{
		title: "Chat en vivo",
		description: "Recibe ayuda inmediata de nuestro equipo de soporte",
		icon: MessageCircle,
		status: "Disponible",
		responseTime: "2-5 minutos",
	},
	{
		title: "Soporte por correo",
		description: "Envíanos un mensaje detallado",
		icon: Mail,
		status: "Disponible",
		responseTime: "24 horas",
	},
	{
		title: "Soporte telefónico",
		description: "Llámanos para problemas urgentes",
		icon: Phone,
		status: "Disponible",
		responseTime: "Inmediato",
	},
	{
		title: "Documentación",
		description: "Consulta nuestras guías completas",
		icon: BookOpen,
		status: "Disponible",
		responseTime: "Instantáneo",
	},
];

export default function HelpPage() {
	const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Ayuda y soporte</h2>
				<p className="text-muted-foreground">
					Encuentra respuestas a preguntas frecuentes y recibe soporte cuando lo necesites.
				</p>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="p-6">
					<div className="relative max-w-2xl mx-auto">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
						<Input
							placeholder="Buscar artículos de ayuda, preguntas frecuentes o soporte..."
							className="pl-8"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* FAQ */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HelpCircle className="h-5 w-5" />
							Preguntas frecuentes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{faqs.map((faq, index) => (
								<div key={faq.question} className="border rounded-lg">
									<button
										type="button"
										className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
										onClick={() =>
											setExpandedFaq(expandedFaq === index ? null : index)
										}
									>
										<div className="flex items-center gap-3">
											<Badge variant="outline" className="text-xs">
												{faq.category}
											</Badge>
											<span className="font-medium">{faq.question}</span>
										</div>
										{expandedFaq === index ? (
											<ChevronDown className="h-4 w-4" />
										) : (
											<ChevronRight className="h-4 w-4" />
										)}
									</button>
									{expandedFaq === index && (
										<div className="px-4 pb-4">
											<p className="text-sm text-muted-foreground">
												{faq.answer}
											</p>
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Support Channels */}
				<Card>
					<CardHeader>
						<CardTitle>Obtener soporte</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{supportChannels.map((channel) => {
								const Icon = channel.icon;
								return (
									<div
										key={channel.title}
										className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
									>
										<div className="flex items-center gap-3">
											<div className="p-2 bg-gray-100 rounded-lg">
												<Icon className="h-5 w-5 text-gray-600" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{channel.title}</h4>
													<Badge variant="default" className="text-xs">
														{channel.status}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{channel.description}
												</p>
												<p className="text-xs text-muted-foreground">
													Tiempo de respuesta: {channel.responseTime}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Documentación
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Consulta nuestra documentación y guías completas
						</p>
						<Button className="w-full">Ver documentación</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Video className="h-5 w-5" />
							Tutoriales en video
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Mira tutoriales en video paso a paso
						</p>
						<Button className="w-full">Ver videos</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Referencia API
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Explora nuestra documentación API
						</p>
						<Button className="w-full">Documentación API</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageCircle className="h-5 w-5" />
							Comunidad
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Únete a nuestro foro de comunidad
						</p>
						<Button className="w-full">Unirse al foro</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
