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
GO111MODULE=on go run ./main.go

# seed admin pertama (sekali saja, idempotent)
GO111MODULE=on go run ./cmd/seed-admin
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

- Default seed admin env: `ADMIN_EMAIL=admin@school.local`, `ADMIN_PASSWORD=change_me_now`
- Untuk IPFS via Pinata: set `STORAGE_PROVIDER=pinata` dan `PINATA_JWT`.
- Untuk mint/revoke on-chain: set `CHAIN_RPC_URL`, `CHAIN_ID`, `CONTRACT_ADDRESS`, `WALLET_PRIVATE_KEY`.
- MFA demo default: `000000`
- Enkripsi PDF dilakukan di backend; storage bisa lokal (`back-end/storage/`) atau Pinata (IPFS) sesuai `STORAGE_PROVIDER`.
