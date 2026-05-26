"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const formSchema = z.object({
	firstName: z
		.string()
		.min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
	lastName: z
		.string()
		.min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
	email: z.string().email({ message: "Ingresa un correo válido." }),
	password: z
		.string()
		.min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});

export default function RegisterPage() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		toast.success("Cuenta creada", {
			description: "Tu cuenta se ha creado correctamente.",
		});
	}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle className="text-2xl">Crear cuenta</CardTitle>
				<CardDescription>
					Ingresa tu información para crear una cuenta.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre</FormLabel>
										<FormControl>
											<Input placeholder="Max" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Apellido</FormLabel>
										<FormControl>
											<Input placeholder="Robinson" {...field} />
										</FormControl>
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
										<Input placeholder="m@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contraseña</FormLabel>
									<FormControl>
										<Input type="password" placeholder="********" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Crear cuenta
						</Button>
						<Button variant="outline" className="w-full">
							Registrarse con Google
						</Button>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					¿Ya tienes una cuenta?{" "}
					<Link href="/iniciar-sesion" className="underline">
						Ingresar
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
