const puppeteer = require('puppeteer');
const wget = require('node-wget-promise');
const path = require('path');
const url = 'https://speakenglishpodcast.com/podcast/';
let browser = null; 

(async () => {
  browser = await puppeteer.launch({headless: false});
  const episodesFromFirstPage = await loadLinksFrom(url); 
  const numberOfEpisodes = discoverTotalEpisodes(episodesFromFirstPage); 
  const numberOfPages = calculateTotalOfPages(numberOfEpisodes, episodesFromFirstPage.length); 

  for(let i = 1; i <= numberOfPages; i ++) {
      const episodes =  i == 1 ? episodesFromFirstPage : await loadLinksFrom(url, i); 

      console.log('Page: ', i);

      episodes.forEach(async episode => {
        getLinkPDFLink(episode.url, episode.description); 
      });    
  }

  setTimeout(async () => {
    await browser.close();  
    console.log('Finished!');
  }, 10000);
    
})();

function discoverTotalEpisodes(episodes) {
  return parseInt(episodes[0].description.slice(1, 4));  
}

function calculateTotalOfPages(numberOfEpisodes, numberOfEpisodesPerPage) {
  return numberOfEpisodes / numberOfEpisodesPerPage; 
}

async function loadLinksFrom(url, pageNumber = 1) {
  const page = await browser.newPage(); 
  await page.goto(`${url}?_page=${pageNumber}`, { waitUntil: 'networkidle2'}); 

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('p.pt-cv-title a._self')).map(item => { return { url: item.href, description: item.text }});
  });

  page.close(); 

  return links; 
}

async function getLinkPDFLink(url, description) {
  const page = await browser.newPage(); 
  await page.goto(url, { waitUntil: 'networkidle2'}); 
  await page.evaluate(() => {
    return document.querySelectorAll('.et-boc ul li a')[1].href; 
  }).then(pdfUrl => {
    downloadFifle(pdfUrl, description); 
  });

  page.close(); 
}

 function downloadFifle(url, filename) {
  return wget(url,
  {
    output: path.join(__dirname, `/pdf/${filename}.pdf`) 
  })
  .then(metadata => {

    console.log('Donloading: ', filename );
    console.log('Size: ', metadata.fileSize );
  });
}


