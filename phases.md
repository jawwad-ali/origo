# Origo: Project Phases

### Phase 1: Foundation (Buniyad)
**Maqsad:** Wo dhancha banana jis par sab kuch khara hoga.
- Project setup: Next.js frontend, NestJS backend, PostgreSQL, Redis
- Login/Signup aur role-based access (kaun kya kar sakta hai)
- Organizations/participants ka registration aur admin approval
- Audit log ka basic system (har action record ho)
- Design system (colors, fonts, components) aur app shell (sidebar, top bar)
- Local dev setup (Docker) aur production deployment (Vercel + Oracle VM)

**Phase complete jab:** Har role ka banda login kar ke apna khali dashboard dekh sake.

---

### Phase 2: Product Identity & QR (P0)
**Maqsad:** Har dabbe ko uska "ID card" dena.
- Manufacturer product aur batch create kar sake (naam, batch no., expiry, storage info)
- Har pack ke liye unique ID generate ho (`MED-2026-000123`)
- QR codes generate hon (secure/signed taake guess na ho sakein)
- QR labels bulk mein export/print karne ki facility

**Phase complete jab:** Manufacturer ek batch bana kar uske 1000 packs ke QR codes nikal sake.

---

### Phase 3: Supply Chain Workflow & Ownership Transfer (P0)
**Maqsad:** Dabbe ka safar record karna.
- Transfer bhejna (send) aur receive/accept karna
- Distributor portal, Wholesaler portal, Pharmacy inventory screens
- Har handover ka tamper-evident record (koi purani entry badal na sake)
- Sirf authorized banda hi transfer kar sake
- Pack ki poori timeline/history view

**Phase complete jab:** Ek pack Factory se Pharmacy tak jaye aur uski poori history sahi dikhe.

---

### Phase 4: Patient Verification (P0)
**Maqsad:** Aam aadmi scan kar ke check kar sake.
- Patient-facing web page (bina login ke QR scan)
- Result screen: ✅ Verified / ⚠️ Warning / ❌ Not recognized
- Product, batch, expiry aur storage info dikhana
- Duplicate/suspicious scan detection (ek hi code bohat jagah scan ho raha ho)
- Mobile-friendly, simple aur aasan zubaan mein result

**Phase complete jab:** Patient phone se scan kare aur sahi, samajh aane wala result mile.

---

### Phase 5: MVP Polish & Launch 🚀
**Maqsad:** Core system ko production-ready aur portfolio-ready banana.
- Security hardening (rate limits, headers, permissions ka review)
- Performance (verify page fast ho, slow queries theek hon)
- UI polish: har screen ke loading, empty aur error states, dark mode, mobile
- Demo seed data aur har role ke demo logins
- Final production deployment, monitoring aur backups

**Phase complete jab:** MVP live ho aur koi bhi visitor demo login se poora flow chala sake.

---

### Phase 6: Expiry & Recall Alerts (P1)
- Expiry ke qareeb wale stock ke alerts (pharmacy/distributor ko)
- Manufacturer/regulator batch recall kar sake
- Recalled pack scan karne par patient ko warning
- Notifications (email/SMS) jahan consent ho

---

### Phase 7: AI Anomaly Detection (P2)
- Data collect hone ke baad patterns analyze karna
- Ajeeb route, zyada holding time, unusual quantities flag karna
- Risk score aur admin ke liye review dashboard (faisla insaan karega)

---

### Phase 8: IoT Cold-Chain Monitoring (P2)
- Temperature/humidity sensors ka integration
- Product ki limits ke against readings check karna
- Limit cross hone par alert aur compliance record

---

### Phase 9: Advanced Security, ZKP + NFC + Blockchain (P3)
*Sirf tab jab business ko waqai zarurat ho.*
- NFC tags se cryptographic verification
- ZKP se privacy-preserving proofs
- Blockchain layer (Hyperledger/Polygon) agar trust model is ka taqaza kare

---

### Phase 10: Scale & Integrations (Ongoing)
- Bade manufacturers ke ERP/WMS systems se integration
- Regulatory reporting
- Multi-country/multi-language support
- Lagatar monitoring, maintenance aur improvements

---

**Khulasa:** Phase 1 se 5 tak asal **MVP** hai (bunyadi aur zaroori). Phase 6 se aage **add-ons** hain, jo MVP chalne aur real data aane ke baad ek ek kar ke lagaye jayenge.
