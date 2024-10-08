const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const moment = require('moment');
const _ = require('underscore');

const DIST_DIR = './dist';
const RESUME_FILE = './resume.json';

let resumeData;
try {
  resumeData = require(RESUME_FILE);
} catch (error) {
  console.error('Error loading resume.json:', error);
  resumeData = {}; // Provide a default empty object
}

// Helper: breaklines
Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});

// Helper: getBuildDate
Handlebars.registerHelper('getBuildDate', function() {
    return moment().format('MMMM Do YYYY, h:mm:ss a');
});

// Helper: toLowerCase
Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
});

// Helper: join
Handlebars.registerHelper('join', function(arr, separator) {
    return arr.join(separator);
});

// Helper: formatDate
Handlebars.registerHelper('formatDate', function(dateString) {
    return moment(dateString).format('MMMM YYYY');
});

async function main() {
  try {
    const template = await fs.readFile(path.join(__dirname, 'resume.hbs'), 'utf-8');
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(resumeData);

    await fs.ensureDir(path.join(__dirname, DIST_DIR));
    await fs.writeFile(path.join(__dirname, DIST_DIR, 'index.html'), html);
    console.log(`index.html written to ${path.join(__dirname, DIST_DIR, 'index.html')}`);

    // Copy resume.json to dist directory
    await fs.copyFile(RESUME_FILE, path.join(__dirname, DIST_DIR, 'resume.json'));
    console.log(`resume.json copied to ${path.join(__dirname, DIST_DIR, 'resume.json')}`);

    console.log('Resume built successfully!');
  } catch (error) {
    console.error('Error building resume:', error);
  }
}

main();
