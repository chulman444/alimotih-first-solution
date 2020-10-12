chrome.tabs.onCreated.addListener(function(tab) {
  const tab_id = tab.id
  if(tab_id) {
    initializeStorage(tab_id)
  }
})

chrome.tabs.onUpdated.addListener(function(tab_id, change_info, tab) {
  // This is called when the url changes but the page doesn't 'reload'
})

chrome.tabs.onRemoved.addListener(function(tab_id) {
  chrome.storage.local.remove(String(tab_id), () => {
    chrome.storage.local.get(null, (results) => {
      console.log(`onRemoved debug ${tab_id}:`)
      console.log(results)
    })
  })
})

chrome.windows.onRemoved.addListener(function() {
  console.log(`Clear local storage`)
  chrome.storage.local.clear()
})

chrome.runtime.onMessage.addListener((message, sender, cb) => {
  const action = message.action
  const tab_id = message.tab_id
  
  if(action == "start") {
    const timer_id = message.timer_id
    
    chrome.storage.local.get([String(tab_id)], (results) => {
      /**
       * 2020-10-12 11:11
       * 
       * Double prevention side effect of bug introduced in `bb84ab8`
       */
      if(results[tab_id].state == "start") {
        return
      }
      
      results[tab_id].timer_ids.push(timer_id)
      results[tab_id].state = "start"
      results[tab_id].start_dt = message.start_dt
      chrome.storage.local.set({ [String(tab_id)]: results[tab_id] }, () => {
        chrome.storage.local.get([String(tab_id)], (results) => {
          console.log(`Debug background action start`)
          console.log(results)
        })
      })
    })
  }
  else if(action == "pause") {
    chrome.storage.local.get([String(tab_id)], (results) => {
      /**
       * 2020-10-12 11:11
       * 
       * Double prevention of bug introduced in `bb84ab8`
       */
      if(results[tab_id].state == "paused") {
        return
      }
      
      const timer_ids = (results[tab_id].timer_ids as Array<any>).slice()
      
      results[tab_id].timer_ids = []
      results[tab_id].value = 100
      results[tab_id].state = "paused"
      
      chrome.storage.local.set({ [String(tab_id)]: results[tab_id] }, () => {
        window.dispatchEvent(new Event("pause"))
        /**
         * 2020-10-08 10:09
         * 
         * https://developer.chrome.com/extensions/runtime#event-onMessage
         * 
         * "Should be" but seems like it MUST be a non-array JSON format.
         */
        cb({ timer_ids })
      })
    })
    /**
     * 2020-10-08 10:09
     * 
     * https://developer.chrome.com/extensions/runtime#event-onMessage
     * 
     * Must return true to use the third argument properly. Took long time to debug this
     */
    return true
  }
  else if(action == "setMinImgArea") {
    const min_img_area = message.min_img_area
    
    chrome.storage.local.get([String(tab_id)], (results) => {
      results[tab_id].min_img_area = min_img_area
      
      chrome.storage.local.set({ [String(tab_id)]: results[tab_id] }, () => {
        cb()
      })
    })
    
    return true
  }
  else if(action == "getMinImgArea") {    
    chrome.storage.local.get([String(tab_id)], (results) => {
      cb({ min_img_area: results[tab_id].min_img_area })
    })
    
    return true
  }
  else if(action == "getState") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab_id = tabs[0].id!
      chrome.storage.local.get([String(tab_id)], (results) => {
        const state = results[tab_id]
        cb(state)
      })
    })
    
    return true
  }
  else if(action == "getStartDt") {
    chrome.storage.local.get([String(tab_id)], (results) => {
      cb({ start_dt: results[tab_id].start_dt })
    })
    return true
  }
})

function initializeStorage(tab_id:number) {
  chrome.storage.local.set({
    [String(tab_id)]: {
      tab_id: tab_id,
      interval: 2000,
      state: "paused",
      timer_ids: [],
      value: 100,
      min_img_area: undefined,
      start_dt: undefined
    }
  }, () => {
    chrome.storage.local.get(null, (results) => {
      console.log(`initializeStorage debug ${tab_id}:`)
      console.log(results)
    })
  })
}