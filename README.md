# 🎓 AskMyNotes

**AskMyNotes** is your ultimate Study Copilot, designed to help students learn and interact with their study materials exactly how they need to. Say goodbye to hallucinations—AskMyNotes scopes its AI context strictly to the notes you upload!

---

## 🚀 Features

- **Subject-Scoped Context**  
  Upload your PDFs and TXT files organized by subject. The AI strictly answers questions based solely on the documents you provided. No outside fluff, no hallucinations.

- **Evidence-Backed Answers**  
  Every AI response includes:
  - **Confidence scores** (High/Medium/Low)
  - **Exact citations**, pointing back to the specific uploaded file and section used.

- **Interactive Study Mode & Quiz Generation**  
  With a click of a button, AskMyNotes scans your documents and auto-generates:
  - 5 Multiple-Choice Questions (MCQs)
  - 3 Short-Answer Questions
  - All questions come mapped with valid explanations and source references.

- **Robust Hybrid Authentication**  
  Secure access crafted for a seamless user experience:
  - **Google Sign-In** (via Firebase Authentication)
  - **Email/Password Authentication** (using a secure Custom JWT implementation)

---

## 🏗️ Architecture & Tech Stack

AskMyNotes leverages a modern, event-driven infrastructure to process, embed, and query your notes seamlessly.

### **Frontend**
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & Shadcn UI
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### **Backend & APIs**
- **API Setup**: Next.js API Routes (`/api/*`) proxying secure connections.
- **AI Orchestration**: **[n8n](https://n8n.io/)** (Webhooks for file upload & RAG orchestration).
- **RAG Pipeline**:
  - *Data Loaders & Recursion Text Splitters*
  - *Embeddings via LLM (Mistral/OpenAI)*

### **Database & Storage**
- **Main DB & Vector Store**: **[Supabase](https://supabase.com/)** (PostgreSQL with `pgvector`).
- **File Uploads**: **[ImageKit](https://imagekit.io/)** (Note handling & URLs).
- **Authentication**: **Firebase** & **Custom JWT auth**.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Local or Cloud instances of Supabase, Firebase, and n8n

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AskMyNotes/hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory. You will need keys for:
   - Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
   - Firebase (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.)
   - JWT Secret (`JWT_SECRET_KEY`)
   - ImageKit
   - n8n Webhook URLs

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---
