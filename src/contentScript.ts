import { browser } from 'webextension-polyfill-ts'

import { initEntryIfPossible } from './storage'

let task_id:null|number = null

async function main() {
  const tab_id = await browser.runtime.sendMessage({ action: 'getTabId'})
  if(tab_id) {
    await initEntryIfPossible(tab_id)
  }
}
main()

browser.runtime.onMessage.addListener((message:any, sender:any) => {
  const action = message.action
  if(action == "shakeImg") {
    const biggest_img_element = getBiggestVisibleImgElement()
    const styles_before = biggest_img_element.style
    console.log(biggest_img_element)
    biggest_img_element.style.animation = "shake 0.5s"
    // biggest_img_element.style.animationIterationCount = 'infinite'
    setTimeout(() => {
      // @ts-ignore
      biggest_img_element.style = styles_before
    }, 500)
  }
  else if(action == "autoClickStart") {
    const interval = message.interval
    clearInterval(task_id!)
    task_id = setInterval(() => {
      const biggest_img_element = getBiggestVisibleImgElement()
      biggest_img_element.click()
      console.log(`Auto click!`)
    }, interval * 1000) as any as number
  }
  else if(action == "autoClickStop") {
    console.log("Received a message")
    clearInterval(task_id!)
    task_id = null
  }
})

function getBiggestVisibleImgElement() {
  const visible_imgs_sorted = Array.from(document.querySelectorAll('img'))
    .filter(el => {
      const rect = el.getBoundingClientRect()
      if(rect.x >= 0 && rect.x <= window.innerWidth && rect.height * rect.width > 0) {
        return true
      }
      else {
        return false
      }
    })
    .sort((a,b) => {
      return b.width * b.height - a.width * a.height
    })
  const biggest_img_element = visible_imgs_sorted[0]
  return biggest_img_element
}