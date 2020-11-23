import { browser } from 'webextension-polyfill-ts'

browser.tabs.onRemoved.addListener(async (tab_id) => {
  console.log(`Removing entries in tab_id: ${tab_id}`)
  await browser.storage.local.remove(String(tab_id))
  const all_entries = await browser.storage.local.get()
  console.log(`All entries after remove:`)
  console.log(all_entries)
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