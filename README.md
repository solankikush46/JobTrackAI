# JobTrackAI

**Your AI-Powered Career Companion.**

JobTrackAI is a comprehensive job application tracking system designed to streamline your job search process. It combines a modern, responsive web dashboard with a powerful Chrome extension to help you organize, track, and manage your job applications effortlessly.

## 🚀 Key Features

*   **AI-Powered Job Extraction:** Automatically extract job details (Company, Title, Location, Description, etc.) from job posting pages using our Chrome Extension.
*   **Centralized Dashboard:** View and manage all your applications in one place with a clean, intuitive interface.
*   **Status Tracking:** Keep track of your application progress with customizable statuses (Applied, Online Assessment, Interviewing, Offer, Rejected).
*   **Smart Filtering:** Easily search and filter applications by status, company, or job title.
*   **Secure Authentication:** User registration and login system with JWT-based authentication.
*   **Responsive Design:** Optimized for a seamless experience across desktop and mobile devices.

## 🛠️ Tech Stack

### Frontend
*   **React:** UI library for building dynamic user interfaces.
*   **Vite:** Next-generation frontend tooling for fast builds.
*   **Tailwind CSS / Custom CSS:** For modern and responsive styling.
*   **Axios:** For handling API requests.
*   **React Router:** For seamless client-side navigation.

### Backend
*   **Node.js & Express:** Robust server-side runtime and framework.
*   **MySQL:** Relational database for structured data storage.
*   **JWT (JSON Web Tokens):** For secure user authentication.
*   **Bcrypt:** For password hashing and security.

### Chrome Extension
*   **Manifest V3:** Built with the latest web extension standards.
*   **Content Scripts:** For interacting with web pages to extract data.
*   **Popup UI:** For quick access to extraction tools and status updates.

### AI Integration
*   **Groq AI:** Leverages advanced LLMs to intelligently parse and structure job data from raw web page content.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v16 or higher)
*   MySQL Server
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/solankikush46/JobTrackAI.git
cd JobTrackAI
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd src/backend
npm install
```

Create a `.env` file in `src/backend` with your configuration:
```env
PORT=4000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=jobtrack_ai
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Initialize the database schema:
```bash
# Log in to MySQL and run the script located at src/backend/sql/schema.sql
mysql -u root -p < src/backend/sql/schema.sql
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd src/frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Chrome Extension Setup
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the `src/extension` directory from the project folder.
5.  The JobTrackAI Scanner extension should now appear in your toolbar.

## 📖 Usage

1.  **Sign Up/Login:** Create an account on the web dashboard.
2.  **Install Extension:** Ensure the Chrome extension is installed and pinned.
3.  **Browse Jobs:** Navigate to any job posting (LinkedIn, Indeed, etc.).
4.  **Scan:** Click the JobTrackAI extension icon. The AI will extract the job details automatically.
5.  **Save:** Review the extracted data and click "Save to Dashboard".
6.  **Track:** Visit your dashboard to view, edit, and manage the application's status.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
