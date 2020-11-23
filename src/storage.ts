import { browser } from 'webextension-polyfill-ts'

export async function initEntryIfPossible(tab_id:number) {
  const entry = await browser.storage.local.get(String(tab_id))
  if(Object.keys(entry).length == 0) {
    console.log(`Entry doesn't exist for tab_id: ${tab_id}. Initializing entry`)
    
    await browser.storage.local.set({
      [tab_id]: {
        state: 'stop',
        interval: 5,
      }
    })
  }
}

export async function updateEntry(tab_id:number, pairs:{ [key:string]: any }) {
  const { [tab_id]: entry } = await browser.storage.local.get(String(tab_id))
  for(const key in pairs) {
    entry[key] = pairs[key]
  }
  await browser.storage.local.set({ [tab_id]: entry })
  const { [tab_id]: result } = await browser.storage.local.get(String(tab_id))
  return result
}