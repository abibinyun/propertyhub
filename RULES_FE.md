# 🧭 📘 FULL GUIDELINE (PRODUCTION-GRADE)

---

# 🧠 0. CORE PRINCIPLE (WAJIB)

> **Next.js = UI Layer Only**
> **NestJS = Business Logic + API Layer**

```txt id="core-principle"
- Next.js hanya untuk UI dan rendering
- NestJS menangani semua business logic dan database
- Tidak boleh ada logic backend di Next.js
```

---

# 📜 1. GLOBAL RULES (HARUS DIPATUHI AI)

```txt id="global-rules"
- Gunakan Server Components sebagai default di Next.js
- Gunakan "use client" hanya untuk interaksi UI
- Semua data HARUS berasal dari NestJS API
- Dilarang akses database langsung dari Next.js
- Dilarang menaruh business logic di Next.js
- Semua komunikasi data melalui HTTP API
- Dilarang fetch data di useEffect jika bisa di server
- Pisahkan dengan tegas server logic dan UI
```

---

# 🔌 2. DATA FETCHING RULES

## ✅ WAJIB (SERVER SIDE)

```jsx id="server-fetch"
export default async function Page() {
  const res = await fetch(`${API_URL}/posts`, {
    cache: "no-store",
  });
  const data = await res.json();

  return <PostList data={data} />;
}
```

---

## ❌ DILARANG (CLIENT FETCH)

```jsx id="client-fetch-wrong"
"use client";

useEffect(() => {
  fetch("/api/posts");
}, []);
```

---

## 📌 RULE TAMBAHAN

```txt id="fetch-rules"
- Gunakan cache: "no-store" untuk data real-time
- Gunakan revalidate untuk ISR jika diperlukan
- Jangan double fetching (server + client)
```

---

# 🔄 3. DATA MUTATION RULES

```txt id="mutation-rules"
- Semua POST/PUT/DELETE langsung ke NestJS API
- Jangan gunakan Server Actions untuk business logic
- Server Actions hanya boleh sebagai proxy ringan (opsional)
```

---

## ✅ Contoh:

```jsx id="mutation-example"
"use client";

async function createPost(data) {
  await fetch(`${API_URL}/posts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

---

# 🧩 4. USE CLIENT RULES

```txt id="use-client-rules"
Gunakan "use client" hanya jika:
- Menggunakan useState / useEffect
- Ada event handler (onClick, onChange)
- Butuh akses window/document
- UI interaktif (modal, dropdown, form)
```

---

## ❌ Dilarang:

```jsx id="bad-use-client"
"use client";

export default function Page() {}
```

---

## ✅ Pola benar:

```jsx id="good-pattern"
// server
export default function Page() {
  return <Button />;
}
```

```jsx id="client-part"
"use client";

function Button() {}
```

---

# 🧱 5. FOLDER STRUCTURE (WAJIB)

```txt id="folder-structure"
app/
  → server components (default)

components/
  ui/        → server components
  client/    → client components

lib/
  api/       → API wrapper ke NestJS
  utils/     → helper functions

types/
  → type API

hooks/
  → client-only hooks
```

---

# 🔌 6. API CLIENT STANDARD

```txt id="api-client"
- Semua request HARUS lewat API wrapper
- Dilarang fetch langsung di banyak tempat
- Gunakan satu pola konsisten
```

---

## ✅ Contoh:

```ts id="api-wrapper"
export async function getPosts() {
  const res = await fetch(`${API_URL}/posts`);
  return res.json();
}
```

---

# 📦 7. API CONTRACT (KRUSIAL)

```txt id="api-contract"
- Semua response HARUS konsisten
- Frontend tidak boleh tebak struktur data
```

---

## ✅ Format standar:

```json id="api-format"
{
  "data": {},
  "meta": {},
  "error": null
}
```

---

# 🧠 8. TYPE SAFETY (WAJIB)

```txt id="type-safety"
- Dilarang menggunakan "any"
- Semua API harus punya type/interface
- Gunakan shared types jika memungkinkan
```

---

# 🔐 9. AUTHENTICATION RULES

```txt id="auth-rules"
- Auth logic hanya di NestJS
- Next.js hanya consume token
- Gunakan cookie (httpOnly jika bisa)
- Semua request attach token otomatis
```

---

## ❌ Dilarang:

```txt id="auth-wrong"
- Validasi role hanya di client
- Menyimpan secret di frontend
```

---

# 🧩 10. STATE MANAGEMENT RULES

```txt id="state-rules"
- Gunakan useState sebagai default
- Hindari global state berlebihan
- Server state tidak perlu disimpan global jika bisa fetch ulang
```

---

# ⚠️ 11. ERROR & LOADING HANDLING

```txt id="error-loading"
- Semua fetch harus punya loading & error state
- Gunakan loading.tsx dan error.tsx
```

---

# 🧱 12. COMPONENT DESIGN RULES

```txt id="component-rules"
- 1 component = 1 tanggung jawab
- Pisahkan server & client component
- Hindari file terlalu besar (>300 baris)
```

---

# 🚫 13. DUPLICATION RULE

```txt id="duplication"
- Dilarang copy-paste logic
- Gunakan reusable function
- Extract ke lib jika dipakai lebih dari sekali
```

---

# 🧠 14. NAMING CONVENTION

```txt id="naming"
- Gunakan nama jelas & konsisten:
  getPosts, createPost, PostList
- Hindari nama generic: data, item, temp
```

---

# 🚀 15. PERFORMANCE RULES

```txt id="performance"
- Minimalkan "use client"
- Gunakan server rendering
- Hindari client-side fetching
- Gunakan caching dengan benar
```

---

# 🔗 16. DEPENDENCY RULE

```txt id="dependency"
- Server component boleh import client
- Client component TIDAK boleh import server
```

---

# 🧪 17. VALIDATION CHECK (WAJIB SEBELUM MERGE)

```txt id="validation"
[ ] Tidak ada business logic di Next.js
[ ] Semua data dari NestJS API
[ ] Tidak ada "use client" berlebihan
[ ] Tidak ada fetch di useEffect
[ ] API contract konsisten
[ ] Semua sudah typed (no any)
[ ] Tidak ada duplikasi logic
```

---

# 🤖 18. FINAL SYSTEM PROMPT (SIAP PAKAI AI)

```txt id="final-prompt"
You are a senior frontend engineer using Next.js as a UI layer and NestJS as backend.

Strict rules:
- Next.js is ONLY for UI
- All business logic must be in NestJS
- All data must come from API
- Use Server Components by default
- Use "use client" only for interactivity
- Never fetch in useEffect if possible on server
- Use API wrapper functions
- Follow strict typing (no any)
- Follow API contract strictly
- Avoid duplication
- Keep components small and focused

Reject any solution that violates separation of concerns.
Optimize for performance, scalability, and clean architecture.
```

---

# 🎯 FINAL SUMMARY

Kalau diringkas jadi 5 hukum utama:

1. **Frontend ≠ Backend (jangan dicampur)**
2. **Server-first di Next.js**
3. **Semua lewat API NestJS**
4. **Typing + contract wajib**
5. **Client hanya untuk interaksi kecil**

---

baca ini juga :

client/AGENTS.md