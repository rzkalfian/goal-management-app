import { expect } from "@playwright/test";

export async function checkContrast(page) {
  const pairs = await page.locator("body *:visible").evaluateAll((elements) => elements.filter((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.width > 1 && bounds.height > 1;
  }).filter((element) =>
    [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
  ).map((element) => {
    let parent = element;
    let background = "rgb(255, 255, 255)";
    while (parent) {
      const color = getComputedStyle(parent).backgroundColor;
      if (/^rgb\(/.test(color)) { background = color; break; }
      parent = parent.parentElement;
    }
    return { text: element.textContent.slice(0, 50), color: getComputedStyle(element).color, background };
  }));
  function luminance(color) {
    const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
      const channel = value / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  }
  for (const pair of pairs) {
    const light = luminance(pair.color), dark = luminance(pair.background);
    const ratio = (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05);
    expect(ratio, `${pair.text}: ${pair.color} on ${pair.background}`).toBeGreaterThanOrEqual(4.5);
  }
}