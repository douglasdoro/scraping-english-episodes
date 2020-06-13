const puppeteer = require('puppeteer');
const wget = require('node-wget-promise');
const path = require('path');
const url = 'https://speakenglishpodcast.com/podcast/';

(async () => {
  const defaultLinks = await loadLinksFrom(url); 
  const totalPages = parseInt(defaultLinks[0].description.slice(1, 4)) / defaultLinks.length;   

  for(let i = 1; i <= totalPages; i ++) {
      const links = await loadLinksFrom(url, i); 

      console.log('Page: ', i);

      links.forEach(async link => {
        const pdfLink = await getLinkPDFLink(link.url); 

        downloadFifle(pdfLink, link.description); 
        console.log('Donloading: ', link.description);
      });    
  }

  console.log('Finished!');
})();

async function loadLinksFrom(url, pageNumber = 1) {
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage(); 

  await page.goto(`${url}?_page=${pageNumber}`, { waitUntil: 'networkidle2'}); 

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('p.pt-cv-title a._self')).map(item => { return { url: item.href, description: item.text }});
  });

  await browser.close();  

  return links; 
}

async function getLinkPDFLink(url) {
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage(); 
  //page.setDefaultTimeout(4000); 
  await page.goto(url, { waitUntil: 'networkidle2'}); 

  const pdfLink = await page.evaluate(() => {
    return document.querySelectorAll('.et-boc ul li a')[1].href; 
  });

  await browser.close(); 

  return pdfLink;
}

 function downloadFifle(url, filename) {
  return wget(url,
  {
    output: path.join(__dirname, `/pdf/${filename}.pdf`) 
  })
  .then(metadata => metadata);
}


