import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminLogin } from "@/lib/api";
import {
	clearAdminSessionToken,
	hasAdminSession,
	setAdminSessionToken,
} from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginState = {
	from?: string;
};

export default function AdminLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	const from = (
		(location.state as LoginState | null)?.from || "/admin"
	).toString();

	useEffect(() => {
		if (hasAdminSession()) {
			navigate("/admin", { replace: true });
		}
	}, [navigate]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		if (!email.trim() || !password) {
			setError("Masukkan email dan password admin.");
			return;
		}

		setLoading(true);

		try {
			const result = await adminLogin(email.trim(), password);
			setAdminSessionToken(result.access_token);
			navigate(from, { replace: true });
		} catch {
			clearAdminSessionToken();
			setError("Email atau password tidak valid.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-[70vh] items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-1 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Masuk Admin</h1>
					<p className="text-sm text-mutedForeground">Khusus petugas sekolah.</p>
				</div>

				<Card className="bg-white/90 backdrop-blur">
					<CardContent className="space-y-4 p-6">
						<form className="space-y-3" onSubmit={handleSubmit}>
							<Input
								type="email"
								placeholder="Email admin"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="username"
							/>
							<Input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
							/>
							<Button type="submit" disabled={loading} className="w-full">
								{loading ? "Memeriksa..." : "Masuk"}
							</Button>
						</form>

						{error && (
							<p className="text-center text-xs text-red-600">{error}</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
