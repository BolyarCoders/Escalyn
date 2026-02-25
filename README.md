# Escalyn

> **Stop arguing with chatbots. Let Escalyn handle the "law talk" for you.**

Escalyn is a dual-platform (Web & Mobile) legal-tech (Customer Complain Flow) service designed to bridge the gap between frustrated consumers and corporate legal departments. If a company fails to honor your rights—whether it's a refund for a damaged dress from *About You* or a flight cancellation — Escalyn automates the formal dispute process from start to finish.

---

## The Mission
Most consumers abandon their claims because legal processes are intimidating and time-consuming. **Escalyn** levels the playing field by providing professional, law-backed representation through an automated, user-friendly interface.

---

## Core Features

* **📱 Cross-Platform Accessibility:** Seamlessly switch between the web dashboard and the mobile app.
* **🤖 Automated Legal Drafting:** Our engine generates formal "Letters of Intent" and "Demand Letters" tailored to specific consumer protection laws.
* **📩 Direct Corporate Outreach:** We don't just email customer support; we target verified legal and compliance contacts.
* **📸 Evidence Vault:** Upload receipts, photos of damaged goods, and chat logs directly into your case file.
* **📊 Real-Time Tracking:** Watch your case move from *Initial Claim* to *Legal Notice Sent* to *Settlement reached*.

---

## How It Works

1.  **Report the Issue:** Tell Escalyn what happened (e.g., "Ordered a dress from About You, arrived torn, they refused a refund").
2.  **Upload Evidence:** Snap a photo of the item and your receipt.
3.  **The "Law Talk":** Escalyn identifies the specific violation of consumer law and generates a formal legal notice.
4.  **Resolution:** We handle the back-and-forth communication until the firm provides a resolution (refund, replacement, or compensation).

---

## Technical Overview

### Tech Stack
* **Frontend:** React / Next.js (Web)
* **Mobile:** React Native / Expo (iOS & Android)
* **Backend:** C# ASP.NET Core
* **AI Logic** n8n
* **Database:** PostgreSQL with Prisma ORM
* **Storage:** AWS S3 (for encrypted evidence storage)

### Installation (Development)

1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/yourusername/escalyn.git](https://github.com/yourusername/escalyn.git)
    cd escalyn
    ```

2.  **Install Web Dependencies:**
    ```bash
    cd apps/web
    npm install
    npm run dev
    ```

3.  **Install Mobile Dependencies:**
    ```bash
    cd apps/mobile
    npm install
    npx expo start
    ```

---

## ⚖️ Legal Disclaimer
Escalyn is a legal-tech platform, not a law firm. We provide automated tools to help users exercise their consumer rights based on available legal frameworks. We do not provide legal advice or courtroom representation.

---

## 🤝 Contributing
We welcome developers and legal experts! 
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/LegalTemplate`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for consumer justice by the Escalyn Team.**
