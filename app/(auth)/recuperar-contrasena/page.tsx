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
	email: z.string().email({
		message: "Ingresa un correo válido.",
	}),
});

export default function ForgotPasswordPage() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		toast.success("Correo de recuperación enviado", {
			description:
				"Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.",
		});
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
				<CardDescription>
					Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
						<Button type="submit" className="w-full">
							Enviar enlace de recuperación
						</Button>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					¿Recordaste tu contraseña?{" "}
					<Link href="/iniciar-sesion" className="underline">
						Ingresar
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
