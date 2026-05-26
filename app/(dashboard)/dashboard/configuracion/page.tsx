"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

const profileFormSchema = z.object({
	username: z
		.string()
		.min(2, {
			message: "El nombre de usuario debe tener al menos 2 caracteres.",
		})
		.max(30, {
			message: "El nombre de usuario no debe tener más de 30 caracteres.",
		}),
	name: z
		.string()
		.min(2, {
			message: "El nombre debe tener al menos 2 caracteres.",
		})
		.max(100, {
			message: "El nombre no debe tener más de 100 caracteres.",
		}),
	email: z
		.string({
			required_error: "Selecciona un correo para mostrar.",
		})
		.email(),
	bio: z.string().max(500, {
		message: "La biografía no debe tener más de 500 caracteres.",
	}),
	urls: z
		.array(
			z.object({
				value: z.string().url({ message: "Ingresa una URL válida." }),
			}),
		)
		.optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database
const defaultValues: Partial<ProfileFormValues> = {
	bio: "Tengo acceso a un computador.",
	urls: [
		{ value: "https://shadcn.com" },
		{ value: "http://twitter.com/shadcn" },
	],
};

export default function SettingsPage() {
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: "onChange",
	});

	function onSubmit(data: ProfileFormValues) {
		console.log("Profile data:", data);
		toast.success("Perfil actualizado correctamente", {
			description: "Tu perfil ha sido actualizado.",
		});
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Perfil</h3>
				<p className="text-sm text-muted-foreground">
					Así es como otros usuarios te verán en el sitio.
				</p>
			</div>
			<Separator />
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<div className="flex items-center gap-6">
						<Avatar className="h-20 w-20">
							<AvatarImage src="/avatars/01.png" alt="@username" />
							<AvatarFallback>JD</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<Label htmlFor="picture">Foto de perfil</Label>
							<Button variant="outline" size="sm" className="w-fit">
								<Camera className="mr-2 h-4 w-4" />
								Cambiar foto
							</Button>
						</div>
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Usuario</FormLabel>
									<FormControl>
										<Input placeholder="username" {...field} />
									</FormControl>
									<FormDescription>
										Este es tu nombre público. Puede ser tu nombre real o un
										seudónimo.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormDescription>
										Este es tu nombre público. Puede ser tu nombre real o un
										seudónimo.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Correo</FormLabel>
								<FormControl>
									<Input placeholder="john.doe@example.com" {...field} />
								</FormControl>
								<FormDescription>
									Puedes gestionar tus correos verificados en tu{" "}
									<a
										href="/dashboard/configuracion/correo"
										className="underline underline-offset-4"
									>
										configuración de correo
									</a>
									.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="bio"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Biografía</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Cuéntanos un poco sobre ti"
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Puedes <span>@mencionar</span> otros usuarios y organizaciones
									para vincularlos.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Actualizar perfil</Button>
				</form>
			</Form>
		</div>
	);
}
