const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');

const DIST_DIR = './dist';
const RESUME_FILE = './resume.json';

const resumeData = require(RESUME_FILE);

// Helper: breaklines
handlebars.registerHelper('breaklines', function(text) {
    text = handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new handlebars.SafeString(text);
});

// Helper: getBuildDate
handlebars.registerHelper('getBuildDate', function() {
    return moment().format('MMMM Do YYYY, h:mm:ss a');
});

// Helper: toLowerCase
handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
});

// Helper: join
handlebars.registerHelper('join', function(arr, separator) {
    return arr.join(separator);
});

async function main() {
  try {
    const template = await fs.readFile(path.join(__dirname, 'resume.hbs'), 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate(resumeData);

    await fs.ensureDir(path.join(__dirname, DIST_DIR));
    await fs.writeFile(path.join(__dirname, DIST_DIR, 'index.html'), html);

    console.log('Resume built successfully!');
  } catch (error) {
    console.error('Error building resume:', error);
  }
}

main();
