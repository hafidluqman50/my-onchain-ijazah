const ADMIN_TOKEN_STORAGE = "admin_access_token";

function getStoredToken() {
	if (typeof window === "undefined") return "";
	return localStorage.getItem(ADMIN_TOKEN_STORAGE) || "";
}

export function getAdminToken() {
	return getStoredToken();
}

export function hasAdminSession() {
	return getStoredToken().trim().length > 0;
}

export function setAdminSessionToken(token: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem(ADMIN_TOKEN_STORAGE, token.trim());
}

export function clearAdminSessionToken() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(ADMIN_TOKEN_STORAGE);
}
