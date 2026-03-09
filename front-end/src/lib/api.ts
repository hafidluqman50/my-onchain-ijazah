import { getAdminToken } from "@/lib/adminAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export type CohortItem = {
	id: number;
	label: string;
};

export type IssueCertificateResponse = {
	certificate_id: number;
	verification_code: string;
	temp_password?: string;
};

export type BatchIssueItem = {
	row: number;
	student_email: string;
	student_name: string;
	certificate_id?: number;
	verification_code?: string;
	temp_password?: string;
	error?: string;
};

export type BatchIssueResponse = {
	total: number;
	success: number;
	failed: number;
	items: BatchIssueItem[];
};

export type AdminCertificateItem = {
	id: number;
	student: {
		id: number;
		name: string;
		email: string;
	};
	cohort_id: number;
	document_hash: string;
	encrypted_cid: string;
	issuer_did: string;
	status: string;
	issued_at: string;
	revoked_at: string | null;
	token_id: string;
	contract_address: string;
	verification_code: string;
};

function adminAuthHeaders() {
	const headers: Record<string, string> = {};
	const token = getAdminToken();
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
}

async function parseResponse(res: Response) {
	if (res.ok) {
		return res.json();
	}

	let message = `HTTP ${res.status}`;
	try {
		const payload = await res.json();
		if (payload?.error) {
			message = payload.error;
		}
	} catch {
		message = await res.text();
	}
	throw new Error(message);
}

export async function adminListCohorts(): Promise<{ cohorts: CohortItem[] }> {
	const res = await fetch(`${API_URL}/admin/cohorts`, {
		headers: adminAuthHeaders(),
	});
	return parseResponse(res);
}

export async function adminCreateCohort(
	label: string,
): Promise<{ cohort: CohortItem; created: boolean }> {
	const res = await fetch(`${API_URL}/admin/cohorts`, {
		method: "POST",
		headers: {
			...adminAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ label }),
	});
	return parseResponse(res);
}

export async function adminCreateCertificate(
	form: FormData,
): Promise<IssueCertificateResponse> {
	const res = await fetch(`${API_URL}/admin/certificates`, {
		method: "POST",
		headers: adminAuthHeaders(),
		body: form,
	});
	return parseResponse(res);
}

export async function adminCreateCertificatesBatch(
	form: FormData,
): Promise<BatchIssueResponse> {
	const res = await fetch(`${API_URL}/admin/certificates/batch`, {
		method: "POST",
		headers: adminAuthHeaders(),
		body: form,
	});
	return parseResponse(res);
}

export async function adminListCertificates(): Promise<{
	certificates: AdminCertificateItem[];
}> {
	const res = await fetch(`${API_URL}/admin/certificates`, {
		headers: adminAuthHeaders(),
	});
	return parseResponse(res);
}

export async function adminLogin(email: string, password: string) {
	const res = await fetch(`${API_URL}/admin/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	return parseResponse(res);
}

export async function studentLogin(email: string, password: string) {
	const res = await fetch(`${API_URL}/student/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	return parseResponse(res);
}

export async function studentListCertificates(token: string) {
	const res = await fetch(`${API_URL}/student/certificates`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return parseResponse(res);
}

export async function studentRequestKey(
	token: string,
	certId: number,
	otp: string,
) {
	const res = await fetch(`${API_URL}/student/certificates/${certId}/key`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ otp }),
	});
	return parseResponse(res);
}

export async function verifyCertificate(params: {
	code?: string;
	tokenId?: string;
	contract?: string;
	hash?: string;
}) {
	const qs = new URLSearchParams();
	if (params.code) qs.set("code", params.code);
	if (params.tokenId) qs.set("tokenId", params.tokenId);
	if (params.contract) qs.set("contract", params.contract);
	if (params.hash) qs.set("hash", params.hash);

	const res = await fetch(`${API_URL}/verify?${qs.toString()}`);
	return parseResponse(res);
}
