// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractText") {
        const text = document.body.innerText;
        const logoUrl = findLogo();
        sendResponse({ text: text, logoUrl: logoUrl });
    }
});

function findLogo() {
    // 1. Try Open Graph image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) return ogImage.content;

    // 2. Try Twitter image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content) return twitterImage.content;

    // 3. Try Link rel icon
    const icon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if (icon && icon.href) return icon.href;

    // 4. Try finding an image with "logo" in class or id
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        const src = img.src;
        const className = img.className.toString().toLowerCase();
        const id = img.id.toString().toLowerCase();
        const alt = img.alt.toString().toLowerCase();

        if ((className.includes('logo') || id.includes('logo') || alt.includes('logo')) && src.startsWith('http')) {
            return src;
        }
    }

    return null;
}
