import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorPageProps {
	title?: string;
	description?: string;
	errorCode?: string;
	actions?: ReactNode;
}

export default function ErrorPage({
	title = "Error del dashboard",
	description = "Ocurrió un problema al cargar el dashboard. Inténtalo nuevamente o contacta a soporte si el problema persiste.",
	errorCode = "Error del dashboard",
	actions,
}: ErrorPageProps) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
						<AlertTriangle className="h-12 w-12 text-red-500" />
					</div>
					<CardTitle className="text-2xl">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-sm text-muted-foreground">
						<p>{errorCode}</p>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
						{actions ?? (
							<>
								<Button onClick={() => window.location.reload()}>
									<RefreshCw className="mr-2 h-4 w-4" />
									Actualizar página
								</Button>
								<Button variant="outline" asChild>
									<Link href="/dashboard">
										<Home className="mr-2 h-4 w-4" />
										Ir al inicio
									</Link>
								</Button>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
