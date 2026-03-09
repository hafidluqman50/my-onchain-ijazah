import { useMutation } from "@tanstack/react-query";
import {
	adminCreateCertificate,
	type IssueCertificateResponse,
} from "@/lib/api";

export type IssueCertificatePayload = {
	cohortId: number;
	studentName: string;
	studentEmail: string;
	studentWallet: string;
	file: File;
};

export function useIssueCertificate() {
	return useMutation({
		mutationFn: async (payload: IssueCertificatePayload) => {
			const form = new FormData();
			form.append("cohort_id", String(payload.cohortId));
			form.append("student_name", payload.studentName);
			form.append("student_email", payload.studentEmail);
			form.append("wallet_address", payload.studentWallet);
			form.append("issuer_did", "");
			form.append(
				"contract_address",
				import.meta.env.VITE_CONTRACT_ADDRESS || "",
			);
			form.append("file", payload.file);

			return (await adminCreateCertificate(form)) as IssueCertificateResponse;
		},
	});
}
