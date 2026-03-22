import { NavLink, useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { clearAdminSessionToken } from "@/lib/adminAuth";

const links = [
	{ to: "/admin", label: "Dashboard", end: true },
	{ to: "/admin/students", label: "Daftar Siswa" },
];

export function AdminNavbar() {
	const navigate = useNavigate();

	function handleSignOut() {
		clearAdminSessionToken();
		navigate("/admin/login", { replace: true });
	}

	return (
		<header className="border-b border-white/10 bg-[#101b2d] text-[#f5e6c8]">
			<Container className="flex h-16 items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#c79635] to-[#2b4168]" />
					<p className="text-sm font-semibold">Admin Console</p>
				</div>

				<nav className="hidden items-center gap-1 md:flex">
					{links.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							end={link.end}
							className={({ isActive }) =>
								`relative px-4 py-2 text-sm font-medium transition-colors ${
									isActive
										? "text-white after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-[#c79635]"
										: "text-[#f5e6c8]/60 hover:text-[#f5e6c8]"
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</nav>

				<button
					onClick={handleSignOut}
					className="text-sm font-medium text-[#f5e6c8]/60 transition-colors hover:text-[#f5e6c8]"
				>
					Sign out
				</button>
			</Container>
		</header>
	);
}
