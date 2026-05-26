"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function handleResend() {
	toast.info("Correo de verificación reenviado", {
		description: "Revisa tu bandeja de entrada para ver el nuevo enlace de verificación.",
	});
}

export default function VerifyEmailPage() {
	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<MailCheck className="mx-auto h-12 w-12 text-gray-400" />
				<CardTitle className="mt-4 text-2xl">Verifica tu correo</CardTitle>
				<CardDescription>
					Hemos enviado un correo a tu dirección. Haz clic en el enlace del
					mensaje para verificar tu cuenta.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="text-center text-sm text-muted-foreground">
					<p>
						¿No recibiste el correo? Revisa tu carpeta de spam o haz clic abajo
						para reenviarlo.
					</p>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-4">
				<Button onClick={handleResend} className="w-full">
					Reenviar correo de verificación
				</Button>
				<Button variant="link" asChild>
					<Link href="/iniciar-sesion">Volver al ingreso</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
