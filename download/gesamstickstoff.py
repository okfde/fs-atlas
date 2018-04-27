from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
import time
import os

binary = FirefoxBinary('/usr/bin/firefox')


profile = FirefoxProfile()
profile.set_preference("browser.download.panel.shown", "false")
profile.set_preference("browser.download.manager.showWhenStarting", "false")
profile.set_preference("browser.helperApps.neverAsk.openFile","application/octet-stream,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
profile.set_preference("browser.helperApps.neverAsk.saveToDisk", "application/octet-stream,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

def wait_clickable(xpath, wait=True):
    try:
        if wait:
            element = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, xpath))
            )
        else:
            element = driver.find_element_by_xpath(xpath)
        element.click()
        return element
    except TimeoutException:
        print('Loading took too much time!')


driver = webdriver.Firefox(firefox_binary=binary, firefox_profile=profile)

# Open the website
driver.get('http://www.wasserdaten.niedersachsen.de')

# Open 'Nährstoffeinträge in Gewässer'
wait_clickable('/html/body/div/div[1]/div[2]/form/div[3]/div[2]/div/div[2]/div/span/div/div[3]/div/span[2]/span[2]/table/tbody/tr/td[2]/span')


nitrat = '/html/body/div/div[1]/div[2]/form/div[3]/div[2]/div/div[2]/div/span/div/div[3]/div[2]/div/span[2]/span[2]/table/tbody/tr/td[2]/span'
gesamstickstoff = '/html/body/div/div[1]/div[2]/form/div[3]/div[2]/div/div[2]/div/span/div/div[3]/div[5]/div/span[2]/span[2]/table/tbody/tr/td[2]/span'


wait_clickable(gesamstickstoff)

# Click Select
wait_clickable('/html/body/div[1]/div[2]/div/div/div[1]/form[1]/div[1]/div/div[1]/div[2]/div/div[3]/div/div[1]/a')

# Focus
e = wait_clickable('/html/body/div[5]/div/input')
e.send_keys(Keys.RETURN)

# wait_clickable('//*[@id="selectorDialogForm:j_idt611:conditionTable:{}:selectAllCheckbox"]'.format(i))
# Close window
# wait_clickable('//*[@id="additionalCloseButton"]')

# Open Ergebinstabelle
# wait_clickable('/html/body/div[1]/div[3]/form/div/div[2]/span/span/div/div[2]/div[1]/a[1]/div/span')


# Open download menu
#wait_clickable('/html/body/div[1]/div[1]/div[2]/form/div[10]/span[1]/div')
## Click download
#wait_clickable('/html/body/div[1]/div[1]/div[2]/form/div[10]/span[1]/div/ul/li')

for i in range(272, 364):
    # Click Select
    # wait_clickable('/html/body/div[1]/div[2]/div/div/div[1]/form[1]/div[1]/div/div[1]/div[2]/div/div[3]/div/div[1]/a')
    # e = wait_clickable('/html/body/div[4]/div/input', True)
    # for j in range(i+1):
    #    e.send_keys(Keys.DOWN)
    # e.send_keys(Keys.RETURN)
    driver.execute_script('var e = document.getElementById("selectorForm:j_idt196:tableCondition"); e.value = {}; $(e).trigger("change")'.format(i))
    time.sleep(1)
    # Open download menu
    wait_clickable('/html/body/div[1]/div[1]/div[2]/form/div[10]/span[1]/div')
    ## Click download
    wait_clickable('/html/body/div[1]/div[1]/div[2]/form/div[10]/span[1]/div/ul/li')
    print(i)
#          os.system("curl 'http://www.wasserdaten.niedersachsen.de/cadenza/actions/tableResult/displayExcelTableResult.xhtml' -H 'Host: www.wasserdaten.niedersachsen.de' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.5' --compressed -H 'Referer: http://www.wasserdaten.niedersachsen.de/cadenza/pages/selector/index.xhtml' -H 'Cookie: AL_SESS=ASQhgHGVdHndiYAEcf6OZwite8zfKRED9hQ_PZd83pWe9R2suzJgT24b9rOlEfP1guTU' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' --output file-{}.xls".format(i))
