import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import multer from 'multer';

console.log("Starting Module Check...");

try {
    const pdfParse = require('pdf-parse');
    console.log("SUCCESS: pdf-parse loaded");
} catch (e) {
    console.error("FAIL: pdf-parse failed to load", e.message);
}

try {
    console.log("SUCCESS: Multer loaded, type:", typeof multer);
} catch (e) {
    console.error("FAIL: Multer failed to load", e.message);
}

import fs from 'fs';
try {
    if (!fs.existsSync('./uploads')) {
        console.log("Uploads dir does not exist, attempting creation...");
        fs.mkdirSync('./uploads');
        console.log("Uploads dir created.");
    } else {
        console.log("Uploads dir exists.");
    }
} catch (e) {
    console.error("FS check failed:", e);
}
