import { useMutation } from "@tanstack/react-query";
import {
	adminCreateCertificatesBatch,
	type BatchIssueResponse,
} from "@/lib/api";

export type IssueBatchPayload = {
	cohortId: number;
	studentsCsv: File;
	file: File;
};

export function useIssueBatchCertificates() {
	return useMutation({
		mutationFn: async (payload: IssueBatchPayload) => {
			const form = new FormData();
			form.append("cohort_id", String(payload.cohortId));
			form.append("issuer_did", "");
			form.append(
				"contract_address",
				import.meta.env.VITE_CONTRACT_ADDRESS || "",
			);
			form.append("students_csv", payload.studentsCsv);
			form.append("file", payload.file);

			return (await adminCreateCertificatesBatch(form)) as BatchIssueResponse;
		},
	});
}
