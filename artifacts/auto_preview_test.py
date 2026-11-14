from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True);page=b.new_page(viewport={'width':1440,'height':1000});trace=[]
 page.on('response',lambda r: trace.append({'url':r.url,'status':r.status}) if '/api/' in r.url else None)
 page.goto('http://localhost:3000');page.get_by_label('Right ascension / degrees').fill('304.693508808');page.get_by_label('Declination / degrees').fill('42.4436872991');page.get_by_role('button',name='Search archive',exact=True).click()
 page.locator('img.sky-image').wait_for(timeout=240000);page.wait_for_function("document.querySelector('img.sky-image').naturalWidth>0")
 assert page.get_by_role('button',name='Blink epochs',exact=True).is_disabled()
 page.screenshot(path='artifacts/automatic-preview.png',full_page=True)
 page.get_by_role('button',name='Load selected observation',exact=True).click();page.locator('img.sky-image').wait_for(timeout=60000);page.wait_for_function("document.querySelector('img.sky-image').naturalWidth>0")
 print('PASS automatic preview and manual reload; trace:',trace);b.close()
