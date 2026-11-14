from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('artifacts');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1000})
 page.goto('http://localhost:3000')
 page.get_by_label('Right ascension / degrees').fill('304.693508808')
 page.get_by_label('Declination / degrees').fill('42.4436872991')
 page.get_by_role('button',name='Search archive',exact=True).click()
 page.get_by_label('Epoch 1',exact=True).wait_for(timeout=240000)
 page.get_by_label('Epoch 1',exact=True).select_option('2ae837e6670cb95e55cbc49891afa63f8b807d1aebdde8dd04f4522a88923325')
 page.get_by_role('button',name='Load selected observation',exact=True).click()
 img=page.locator('img.sky-image');img.wait_for(timeout=180000)
 page.wait_for_function("document.querySelector('img.sky-image')?.naturalWidth > 0")
 assert page.get_by_role('button',name='Blink epochs',exact=True).is_disabled()
 img.scroll_into_view_if_needed();page.screenshot(path=str(out/'user-position-observation.png'),full_page=True)
 print('PASS exact-position browser image',page.locator('img.sky-image').get_attribute('src'));browser.close()
