import fs from 'fs';

const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
const fileContent = "John Doe\nSoftware Engineer\nExperience: 5 years in Node.js";

const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="resume"; filename="test.txt"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `${fileContent}\r\n` +
    `--${boundary}--\r\n`;

console.log("Sending upload request to localhost:5000...");
try {
    const res = await fetch('http://localhost:5000/api/analyze-upload', {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
} catch (e) {
    console.error("Fetch failed:", e);
}
