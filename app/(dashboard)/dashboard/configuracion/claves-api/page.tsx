"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Plus, MoreHorizontal, Copy, Trash2, Eye } from "lucide-react";

const apiKeys = [
	{
		id: 1,
		name: "Clave de producción",
		token: "prod_sk_************************1234",
		created: "2023-10-21",
		lastUsed: "Hace 2 minutos",
		status: "Activa",
	},
	{
		id: 2,
		name: "Clave de pruebas",
		token: "stg_sk_************************5678",
		created: "2023-09-15",
		lastUsed: "Hace 3 días",
		status: "Activa",
	},
	{
		id: 3,
		name: "Clave de desarrollo",
		token: "dev_sk_************************abcd",
		created: "2023-08-01",
		lastUsed: "Hace 1 mes",
		status: "Revocada",
	},
];

export default function ApiKeysPage() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Claves API</h3>
				<p className="text-sm text-muted-foreground">
					Administra claves API para tus aplicaciones y servicios.
				</p>
			</div>
			<Separator />

			<Card>
				<CardHeader>
					<CardTitle>Crear nueva clave API</CardTitle>
					<CardDescription>
						Las claves API se usan para autenticar solicitudes con la API.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1 space-y-2">
							<Label htmlFor="keyName">Nombre de la clave</Label>
							<Input id="keyName" placeholder="Ej.: Mi aplicación" />
						</div>
						<div className="flex items-end">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Crear clave
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Tus claves API</CardTitle>
					<CardDescription>Tienes {apiKeys.length} claves API.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Token</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead>Creada</TableHead>
								<TableHead>Último uso</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{apiKeys.map((key) => (
								<TableRow key={key.id}>
									<TableCell className="font-medium">{key.name}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<span className="font-mono">{key.token}</span>
											<Button variant="ghost" size="icon" className="h-6 w-6">
												<Copy className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant={key.status === "Activa" ? "default" : "outline"}
										>
											{key.status}
										</Badge>
									</TableCell>
									<TableCell>{key.created}</TableCell>
									<TableCell>{key.lastUsed}</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>
													<Eye className="mr-2 h-4 w-4" />
													Ver detalles
												</DropdownMenuItem>
												<DropdownMenuItem className="text-red-500">
													<Trash2 className="mr-2 h-4 w-4" />
													Revocar clave
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
