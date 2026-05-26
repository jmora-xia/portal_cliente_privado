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
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const formSchema = z.object({
	code: z.string().min(6, {
		message: "El código de verificación debe tener 6 caracteres.",
	}),
});

export default function TwoFactorAuthPage() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		toast.success("Autenticación de dos factores activada", {
			description: "Tu cuenta ahora está protegida con 2FA.",
		});
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
				<CardTitle className="mt-4 text-2xl">
					Autenticación de dos factores
				</CardTitle>
				<CardDescription>
					Mejora tu seguridad activando 2FA.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center space-y-4">
					<p className="text-sm text-muted-foreground">
						1. Escanea el código QR con tu aplicación de autenticación.
					</p>
					<div className="p-4 border-2 border-dashed rounded-lg">
						{/* QR Code Placeholder */}
						<div className="h-32 w-32 bg-gray-200 animate-pulse flex items-center justify-center">
							<p className="text-xs text-muted-foreground">Código QR</p>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						2. Ingresa el código de 6 dígitos de tu aplicación.
					</p>
				</div>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="mt-6 space-y-6"
					>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Código de verificación</FormLabel>
									<FormControl>
										<InputOTP maxLength={6} {...field} className="mx-auto">
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
									</FormControl>
									<FormDescription className="text-center">
										Ingresa el código de verificación de tu aplicación de
										autenticación.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Verificar y activar
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
