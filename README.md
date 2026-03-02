# 🎓 AskMyNotes

**AskMyNotes** is your ultimate Study Copilot, designed to help students learn and interact with their study materials exactly how they need to. Say goodbye to hallucinations—AskMyNotes scopes its AI context strictly to the notes you upload!

---

## 🚀 Features

- **Subject-Scoped Context**  
  Organize your notes into dedicated Subjects (max 3 subjects). Upload your PDFs and TXT files directly to a subject, and the AI will only answer based on the material in that specific subject, completely avoiding hallucinations.

- **Evidence-Backed Answers**  
  Every answer comes with confidence scores and exact citations pointing you to the page and snippet in your notes.

- **Interactive Study Mode**  
  Auto-generate Multiple Choice (MCQ) and Short Answer questions straight from your study materials to test your knowledge. Validates answers and stores your study history for review.

- **Robust Authentication & Secuity**  
  Secure access crafted for a seamless user experience using Firebase Authentication and custom JWT.

---

## 🏗️ Architecture & Tech Stack

AskMyNotes leverages a modern, event-driven infrastructure to process, embed, and query your notes seamlessly.

### **Frontend**
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/), Radix UI, Shadcn UI
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: Lucide React

### **Backend & APIs**
- **API Setup**: Next.js App Router API Routes (`/api/subjects`, `/api/upload-notes`, `/api/generate-questions`, `/api/save-answers`, etc.) proxying secure connections.
- **AI Orchestration**: **[n8n](https://n8n.io/)** (Webhooks for file upload & RAG orchestration).
- **RAG Pipeline**:
  - *Data Loaders & Recursion Text Splitters*
  - *Embeddings via LLM (Mistral/OpenAI)*

### **Database & Storage**
- **Main DB & Vector Store**: **[Supabase](https://supabase.com/)** (PostgreSQL with `pgvector` for efficient similarity search).
- **File Uploads**: **[ImageKit](https://imagekit.io/)** (Note handling & URLs).
- **Authentication**: **Firebase** & **Custom Node JWT auth**.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- Local or Cloud instances of Supabase, Firebase, ImageKit, and n8n

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AskMyNotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory. You will need keys for:
   - **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
   - **Firebase** (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.)
   - **ImageKit** (`IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`)
   - **JWT Authentication** (`JWT_SECRET`)

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to launch the application.