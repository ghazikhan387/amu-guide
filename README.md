# AMU Guide — AI-Powered Student Assistant

An intelligent, AI-powered assistant designed to help students navigate **Aligarh Muslim University (AMU)**. Built with a modern **RAG (Retrieval-Augmented Generation)** pipeline, it provides accurate information about admissions, fee structures, academic calendars, and campus life by retrieving relevant context from an optimized knowledge base.

![AMU Guide Interface](https://raw.githubusercontent.com/your-username/amu-guide/main/public/screenshot.png) *(Placeholder for your screenshot)*

## 🚀 Key Features

- **AI-Powered Chat:** Instant answers using state-of-the-art LLMs (Qwen 2.5).
- **RAG Architecture:** Real-time retrieval from an optimized knowledge base stored in Supabase.
- **Smart Retrieval:** Uses `pgvector` and HNSW indexing for high-speed, accurate semantic search.
- **Optimized Knowledge Base:** Hand-curated Markdown files structured for maximum retrieval performance.
- **Premium UI:** Sleek, modern interface built with Tailwind CSS and Next.js.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15+, React 19, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL with `pgvector`)
- **AI Models:** 
  - **Generation:** Qwen/Qwen2.5-Coder-32B-Instruct (via Hugging Face)
  - **Embeddings:** all-MiniLM-L6-v2 (via Hugging Face)
- **Deployment:** Vercel (recommended)

## 📖 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/amu-guide.git
cd amu-guide
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file based on `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
HUGGINGFACE_API_KEY=your_hf_api_key
```

### 4. Database Setup
Run the SQL migration found in `supabase/setup.sql` in your Supabase SQL Editor. This will:
- Enable the `vector` extension.
- Create the `documents` table.
- Set up the HNSW index for high-performance search.
- Configure Row Level Security (RLS).

### 5. Ingest Knowledge Base
Run the ingestion script to process and embed the documents:
```bash
npx tsx scripts/ingest.ts
```

### 6. Run Locally
```bash
npm run dev
```

## 📂 Knowledge Base Structure

The AI's intelligence is powered by curated Markdown files in `data/knowledge/`. We use a specialized **RAG-optimized format** including:
- `[CHUNK: NAME]` headers for better contextual boundary detection.
- Embedded metadata tags (e.g., `Topic: Admission`, `Level: UG`).
- Structured tables for complex data like fee structures.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
