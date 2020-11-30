import { browser } from 'webextension-polyfill-ts'

import { updateEntry, initEntryIfPossible } from './storage'

browser.tabs.onRemoved.addListener(async (tab_id) => {
  console.log(`Removing entries in tab_id: ${tab_id}`)
  await browser.storage.local.remove(String(tab_id))
  const all_entries = await browser.storage.local.get()
  console.log(`All entries after remove:`)
  console.log(all_entries)
})

browser.tabs.onUpdated.addListener(async (tab_id, change_info, tab) => {
  if(change_info.status == "complete") {
    await initEntryIfPossible(tab_id)
    const { [tab_id]: { url: old_url } } = await browser.storage.local.get(String(tab_id))
    if(old_url) {
      const url = await browser.tabs.sendMessage(tab_id, { action: "getUrl" })
      const old_url_obj = new URL(old_url)
      const url_obj = new URL(url)
      console.log(old_url_obj, url_obj)
      if(old_url_obj.host != url_obj.host) {
        await browser.tabs.sendMessage(tab_id, { action: "autoClickStop" })
      }
      else {
        const result = await updateEntry(tab_id, { url })
      }
    }
  }
})

browser.runtime.onMessage.addListener(async (message, sender) => {
  const action = message.action
  
  if(action == 'getTabId') {
    const tab_id = sender.tab?.id
    
    if(tab_id) {
      return tab_id
    }
  }
})