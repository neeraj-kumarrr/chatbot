// scrapeWebsite.js
const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs').promises;

async function getVisibleOrTextContent(driver, el) {
  const txt = await el.getText(); // visible text
  if (txt && txt.trim()) return txt.trim();
  const tc = await el.getAttribute('textContent'); // fallback for nested spans
  return (tc || '').replace(/\s+/g, ' ').trim();
}

async function scrollPage(driver) {
  await driver.executeScript('window.scrollTo(0, 0)');
  let lastH = 0;
  for (let i = 0; i < 12; i++) {
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    await driver.sleep(800);
    const h = await driver.executeScript('return document.body.scrollHeight');
    if (h === lastH) break;
    lastH = h;
  }
}

async function scrapeWebsite() {
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    const url = 'https://finadvantage.com';
    await driver.get(url);

    // Wait for a reliable container from the pasted DOM (Elementor main)
    await driver.wait(
      until.elementLocated(By.css('main.site-main, .elementor.elementor-82')),
      15000
    );
    await driver.wait(until.elementIsVisible(
      await driver.findElement(By.css('main.site-main, .elementor.elementor-82'))
    ), 5000);

    // Trigger lazy content
    await scrollPage(driver);

    // Collect headings, paragraphs, and Elementor text widgets
    const selectors = [
      'h1','h2','h3','h4','h5','h6',
      'p','li',
      '.elementor-heading-title',
      '.elementor-widget-text-editor',
      '.elementor-button-text',
      '.elementor-widget-container',
      '.elementor-shortcode',
      '.elementor-widget-ucaddon_logo_marquee',
      '.elementor-widget-ucaddon_image_card_carousel',
    ];
    const elements = await driver.findElements(By.css(selectors.join(',')));

    const chunks = [];
    for (const el of elements) {
      const t = await getVisibleOrTextContent(driver, el);
      if (t && t.length > 0) chunks.push(t);
    }

    // De-duplicate and clean
    const cleaned = Array.from(new Set(
      chunks
        .map(s => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
    ));

    // Optional: whitelist likely informative lines
    const keywords = [
      'FinAdvantage','Accounting','Bookkeeping','Tax','Valuation','M&A','Due Diligence',
      'Services','Clients','Case Study','Contact','Book a Meeting','SOC 1','certified',
      '+1', '+91', '@finadvantage.com'
    ];
    const scored = cleaned.filter(line => {
      const l = line.toLowerCase();
      return line.length > 25 ||
             keywords.some(k => l.includes(k.toLowerCase()));
    });

    const text = (scored.length ? scored : cleaned).join('\n');

    await fs.writeFile('scraped_data.txt', text, 'utf-8');
    console.log(`Scraped ${scored.length || cleaned.length} lines to scraped_data.txt`);
    return text;
  } catch (e) {
    console.error('Error during scraping:', e);
    return '';
  } finally {
    await driver.quit();
  }
}

module.exports = { scrapeWebsite };
