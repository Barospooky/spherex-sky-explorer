from playwright.sync_api import sync_playwright
import json
from pathlib import Path
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True);page=b.new_page(viewport={'width':1440,'height':1000});page.goto('http://localhost:3000')
 page.get_by_role('button',name='Use previously verified sky region',exact=True).click()
 with page.expect_response(lambda r:'/api/compatible-pair?' in r.url,timeout=240000) as response:
  page.get_by_role('button',name='Find compatible pair',exact=True).click()
 d=response.value.json();assert d['comparison'],d
 Path('artifacts/discovery-e2e.json').write_text(json.dumps(d,indent=2))
 page.get_by_role('button',name='Side by side',exact=True).wait_for(timeout=60000)
 page.wait_for_function("document.querySelectorAll('img.sky-image').length===2 && Array.from(document.querySelectorAll('img.sky-image')).every(i=>i.naturalWidth>0)")
 page.get_by_role('button',name='Blink epochs',exact=True).click();before=page.locator('img.sky-image').get_attribute('src');page.wait_for_timeout(900);assert page.locator('img.sky-image').get_attribute('src')!=before
 page.get_by_role('button',name='Pause',exact=True).click();page.get_by_role('button',name='Next',exact=True).click();assert page.get_by_role('slider',name='Selected epoch').input_value()=='1'
 page.get_by_role('button',name='Before / after',exact=True).click();page.get_by_label('Before / after reveal').fill('40')
 page.get_by_role('button',name='Planet X Lab',exact=True).click();page.get_by_label('Investigation notes').fill('Unverified visual inspection. No discovery claim.')
 with page.expect_download() as download:page.get_by_role('button',name='Export notes with observation provenance').click()
 download.value.save_as('artifacts/discovery-notes.json');page.screenshot(path='artifacts/discovery-e2e.png',full_page=True)
 print('PASS automatic discovery -> aligned images -> blink -> timeline -> wipe -> Planet X notes export',d['comparison']['valid_pixels']);b.close()
