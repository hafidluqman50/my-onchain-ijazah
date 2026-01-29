# My Onchain Ijazah

Monorepo untuk sistem ijazah SBT: portal admin, portal verifikasi, dan backend issuance.

## Struktur
- `front-end/` React + Vite + Tailwind + shadcn UI
- `back-end/` Go (Gin + Gorm) + Postgres
- `smart-contract/` kontrak SBT (template)

## Quick Start (Local)

### 1) Jalankan Postgres
```bash
docker compose up -d
```

### 2) Backend
```bash
cd back-end
cp .env.example .env
# edit .env jika perlu

# run API
GO111MODULE=on go run ./cmd/api
```

API akan listen di `http://localhost:8080`.

### 3) Frontend
```bash
cd front-end
cp .env.example .env
npm install
npm run dev
```

Frontend akan listen di `http://localhost:5173`.

## Notes
- Admin key default: `dev_admin_key_change_me`
- MFA demo default: `000000`
- Enkripsi PDF dilakukan di backend, file terenkripsi disimpan lokal (`back-end/storage/`).

