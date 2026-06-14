# 💡 AI Startup Idea Validator

The AI Startup Idea Validator is an intelligent, full-stack web application engineered to evaluate and refine entrepreneurial concepts. By leveraging Google's Gemini AI, the system analyzes user-submitted business ideas to provide actionable feedback, market potential analysis, and objective success scoring, helping founders validate their vision before investing capital.

🚀 **[Live Demo](https://ai-startup-idea-validator-three.vercel.app/)**

*(Note: The live demo runs a highly optimized browser simulation of the AI logic for instant access. To utilize the full Java backend and real Gemini API integration, please refer to the local setup instructions below.)*

---

## 🌟 Key Features

* **Intelligent Analysis Engine:** Evaluates startup ideas across multiple dimensions to generate concrete pros, cons, and strategic improvement suggestions.
* **Objective Success Scoring:** Provides a data-driven 1-10 success probability score with visually engaging, animated circular progress indicators.
* **Modern Minimalist UI:** Designed with a sleek, premium layout featuring glassmorphic elements, smooth micro-animations, and a seamless Dark/Light mode toggle.
* **PDF Report Generation:** Compiles comprehensive, professionally formatted PDF reports of the AI analysis for pitching to investors (Backend required).
* **Historical Tracking:** Securely stores past analyses in a relational database, allowing users to track how their ideas evolve over time.

---

## 🛠️ Modern Tech Stack & Tooling

* **Frontend Architecture:** Built using HTML5, CSS3, and Vanilla JavaScript to ensure zero-dependency, lightning-fast rendering speeds in the browser.
* **Backend Runtime:** Powered by **Java 17** and **Spring Boot 3.2** for a highly secure, enterprise-grade REST API architecture.
* **AI Integration Layer:** Configured to interface seamlessly with the **Google Gemini AI API** using reactive WebClient infrastructure.
* **Database & Persistence:** Utilizes **MySQL 8** connected via Spring Data JPA for robust object-relational mapping and data integrity.
* **Document Processing:** Integrates **OpenPDF** to construct dynamic, styled PDF reports directly from the server memory.

---

## 📂 Project Structure

```text
AI-Startup-Idea-Validator/
├── backend/               # Spring Boot REST API source code and models
├── frontend/              # Responsive HTML/CSS/JS client-side application
├── database/              # MySQL schema definitions and initialization scripts
├── docs/                  # API documentation and local setup guides
└── package.json           # Vercel deployment configuration script
```

---

## 🚀 Setup & Launch Instructions

To run the full stack locally with real database connections and API keys, please review the comprehensive **[Local Setup Guide](docs/SETUP_GUIDE.md)**.
