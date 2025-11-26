// This script runs on the JobTrackAI web app (localhost:5173)
// It reads the JWT token from localStorage and syncs it to the extension's storage

console.log("JobTrackAI Extension: Auth Sync Script Loaded");

function syncToken() {
    const token = localStorage.getItem("token");
    if (token) {
        chrome.storage.local.set({ token: token }, () => {
            console.log("JobTrackAI Extension: Token synced successfully.");
        });
    } else {
        console.log("JobTrackAI Extension: No token found in localStorage.");
    }
}

// Run immediately
syncToken();

// Also listen for storage changes (in case user logs in while page is open)
window.addEventListener("storage", (event) => {
    if (event.key === "token") {
        syncToken();
    }
});
