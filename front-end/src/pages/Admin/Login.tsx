import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminLogin } from "@/lib/api";
import {
	clearAdminSessionToken,
	hasAdminSession,
	setAdminSessionToken,
} from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";

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
		<Container className="space-y-8">
			<SectionTitle
				title="Masuk Admin"
				subtitle="Masukkan email dan password untuk membuka dashboard."
			/>

			<Card className="mx-auto max-w-xl bg-white/90 backdrop-blur">
				<CardHeader>
					<CardTitle>Akses Dashboard</CardTitle>
					<CardDescription>
						Login ini hanya untuk petugas sekolah.
					</CardDescription>
				</CardHeader>
				<CardContent>
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
						<Button type="submit" disabled={loading}>
							{loading ? "Memeriksa..." : "Masuk"}
						</Button>
					</form>

					{error && (
						<div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
							{error}
						</div>
					)}
				</CardContent>
			</Card>
		</Container>
	);
}
