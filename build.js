const fs = require('fs-extra');
const axios = require('axios');
const puppeteer = require('puppeteer');
const path = require('path');

const gist = 'https://gist.github.com/HUSAM-07/b3349c21e7f7966b2a99b80a020d8e52';
const DIST_DIR = './dist';
const RESUME_FILE = 'resume.json';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set this in your environment variables

async function fetchResume() {
  try {
    if (fs.existsSync(RESUME_FILE)) {
      console.log(`Loading from local "${RESUME_FILE}"`);
      return JSON.parse(fs.readFileSync(RESUME_FILE, 'utf-8'));
    }
    
    console.log(`Downloading resume... [${gist}]`);
    const { data } = await axios.get(`https://api.github.com/gists/${gist}`, {
      headers: GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {}
    });
    const resumeContent = data.files['resume.json'].content;
    return JSON.parse(resumeContent);
  } catch (error) {
    console.error('Error fetching resume:', error.message);
    throw error;
  }
}

async function buildHTML(resume) {
  try {
    console.log('Rendering...');
    const { render } = require('./index.js');
    const html = await render(resume);
    
    await fs.ensureDir(DIST_DIR);
    await fs.writeFile(path.join(DIST_DIR, 'index.html'), html, 'utf-8');
    console.log('HTML file saved successfully.');
    return html;
  } catch (error) {
    console.error('Error building HTML:', error.message);
    throw error;
  }
}

async function buildPDF(html) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Opening puppeteer...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      displayHeaderFooter: false,
      printBackground: true,
      margin: {
        top: '0.4in',
        bottom: '0.4in',
        left: '0.4in',
        right: '0.4in',
      }
    });
    await browser.close();
    
    await fs.writeFile(path.join(DIST_DIR, 'resume.pdf'), pdf);
    console.log('PDF file saved successfully.');
  } catch (error) {
    console.error('Error building PDF:', error.message);
    throw error;
  }
}

async function buildAll() {
  try {
    await fs.remove(DIST_DIR);
    const resume = await fetchResume();
    const html = await buildHTML(resume);
    await buildPDF(html);
    console.log('Build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Remove the duplicate buildResume function and its call
// Keep only the buildAll() call at the end of the file
buildAll();
