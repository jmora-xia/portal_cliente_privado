"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Plus,
	MoreHorizontal,
	Mail,
	Phone,
	Filter,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const users = [
	{
		id: 1,
		name: "John Doe",
		email: "john.doe@example.com",
		role: "Admin",
		status: "Active",
		avatar: "/avatar.png",
		lastSeen: "2 hours ago",
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane.smith@example.com",
		role: "User",
		status: "Active",
		avatar: "/avatar.png",
		lastSeen: "1 day ago",
	},
	{
		id: 3,
		name: "Bob Johnson",
		email: "bob.johnson@example.com",
		role: "Moderator",
		status: "Inactive",
		avatar: "/avatar.png",
		lastSeen: "1 week ago",
	},
	{
		id: 4,
		name: "Alice Brown",
		email: "alice.brown@example.com",
		role: "User",
		status: "Active",
		avatar: "/avatar.png",
		lastSeen: "3 hours ago",
	},
	{
		id: 5,
		name: "Charlie Wilson",
		email: "charlie.wilson@example.com",
		role: "User",
		status: "Pending",
		avatar: "/avatar.png",
		lastSeen: "Never",
	},
];

export default function UsersPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Users</h2>
					<p className="text-muted-foreground">
						Manage user accounts and permissions.
					</p>
				</div>
				<Button className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					Add User
				</Button>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
							<Input placeholder="Search users..." className="pl-8" />
						</div>
						<Button variant="outline" className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							Filter
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Last Seen</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={user.avatar} alt={user.name} />
												<AvatarFallback>
													{user.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">{user.name}</div>
												<div className="text-sm text-muted-foreground">
													{user.email}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant={user.role === "Admin" ? "default" : "secondary"}
										>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												user.status === "Active"
													? "default"
													: user.status === "Inactive"
														? "secondary"
														: "outline"
											}
										>
											{user.status}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{user.lastSeen}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem className="flex items-center gap-2">
													<Mail className="h-4 w-4" />
													Send Email
												</DropdownMenuItem>
												<DropdownMenuItem className="flex items-center gap-2">
													<Phone className="h-4 w-4" />
													Call
												</DropdownMenuItem>
												<DropdownMenuItem>Edit User</DropdownMenuItem>
												<DropdownMenuItem className="text-red-600">
													Delete User
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
