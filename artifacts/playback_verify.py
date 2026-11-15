from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('artifacts');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1000})
 page.goto('http://localhost:3000')
 page.get_by_label('Right ascension / degrees').fill('127.69444')
 page.get_by_label('Declination / degrees').fill('-39.17760')
 page.get_by_role('button',name='Search archive',exact=True).click()
 page.get_by_label('Epoch 1',exact=True).wait_for(timeout=240000)
 page.get_by_label('Epoch 1',exact=True).select_option('cc6d75f35e5a129b0e15a88cca7b8c70fd0c0fe84ea4a6083df6cdea4eb6617d')
 page.get_by_role('button',name='Load selected observation',exact=True).click()
 img=page.locator('img.sky-image');img.wait_for(timeout=180000)
 page.wait_for_function("document.querySelector('img.sky-image')?.naturalWidth > 0")
 assert page.get_by_role('button',name='Blink epochs',exact=True).is_disabled()
 img.scroll_into_view_if_needed();page.screenshot(path=str(out/'real-observation-desktop.png'),full_page=True)
 page.get_by_role('button',name='Time Comparison',exact=True).click()
 pair=json.loads(Path('backend/data/epoch-test-False.json').read_text())['comparison']['frames']
 for i,f in enumerate(pair): page.get_by_label(f'Epoch {i+1}',exact=True).select_option(f['observation']['id'])
 page.get_by_role('button',name='Align & compare epochs',exact=True).click()
 page.get_by_role('button',name='Side by side',exact=True).wait_for(timeout=180000)
 assert page.locator('img.sky-image').count()==2
 page.wait_for_function("Array.from(document.querySelectorAll('img.sky-image')).every(i=>i.naturalWidth>0)")
 page.screenshot(path=str(out/'verified-comparison.png'),full_page=True)
 page.get_by_role('button',name='Before / after',exact=True).click()
 page.get_by_label('Before / after reveal').fill('35')
 assert '65%' in page.locator('img[alt^="After:"]').get_attribute('style')
 page.screenshot(path=str(out/'before-after.png'),full_page=True)
 page.get_by_role('button',name='Next',exact=True).click()
 assert page.get_by_role('slider',name='Selected epoch').input_value()=='1'
 page.get_by_role('button',name='Previous',exact=True).click()
 assert page.get_by_role('slider',name='Selected epoch').input_value()=='0'
 page.get_by_role('button',name='Blink epochs',exact=True).click()
 before=page.locator('img.sky-image').get_attribute('src');page.wait_for_timeout(900)
 assert before!=page.locator('img.sky-image').get_attribute('src')
 page.get_by_role('button',name='Pause',exact=True).click()
 page.get_by_role('button',name='Planet X Lab',exact=True).click()
 page.get_by_label('Investigation notes').fill('Unverified inspection note; no discovery claim.')
 assert page.get_by_role('button',name='Export notes with observation provenance').is_enabled()
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(out/'real-observation-mobile.png'),full_page=True)
 print('PASS browser search, real PNG decoded, playback guarded, lab navigation and notes; mobile overflow:',page.evaluate('document.documentElement.scrollWidth > innerWidth'))
 browser.close()
