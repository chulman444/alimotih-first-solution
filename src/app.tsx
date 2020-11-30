import React from 'react';
import { browser } from 'webextension-polyfill-ts'
import { updateEntry } from './storage'
import { Typography, Box, CircularProgress } from '@material-ui/core'

class App extends React.Component<any, any> {
  tab_id:number = -1
  progress_animation_id = -1
  
  constructor(props:any) {
    super(props)
    
    this.state = {}
    
    this.asyncConstructor()
  }
  
  async asyncConstructor() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tab_id = tabs[0].id
    
    if(tab_id) {
      this.tab_id = tab_id
      const { [tab_id]: entry } = await browser.storage.local.get(String(tab_id))
      const state = Object.assign(entry)
      await new Promise((res, rej) => {
        this.setState(state, () => {
          this.forceUpdate(() => res())
        })
      })
      
      if(this.state.state == "start") {
        this.startCountAnimation(this.state.start_dt)
      }
      else {
        this.setState({ progress: 100 })
      }
    }
  }
  
  async componentDidMount() {
  }
  
  render() {
    return (
      <>
        <div>Tab id: {this.tab_id}</div>
        <Box position="relative" display="inline-flex" >
          <CircularProgress
            variant="static"
            value={this.state.progress}
            size={200}
          />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <div>
              <input
                type="text"
                value={this.state.interval}
                size={4}
                placeholder="Interval"
                onChange={(ev) => this.onIntervalChange(ev)}
              />
              <button onClick={() => this.toggleState()}>{this.getAction()}</button>
            </div>
            <div>
              <button onClick={() => this.shakeImg()}>Shake img</button>
            </div>
          </Box>
        </Box>
      </>
    )
  }
  
  async onIntervalChange(ev:React.ChangeEvent<HTMLInputElement>) {
    const new_value = ev.target.value
    const { interval: new_interval } = await updateEntry(this.tab_id, { interval: new_value })
    this.setState({ interval: new_interval })
  }
  
  getAction() {
    return this.state.state == "stop" ? "start" : "stop"
  }
  
  async toggleState() {
    if(this.state.state == "stop") {
      const { state: new_state } = await updateEntry(this.tab_id, { state: "start" })
      this.setState({ state: new_state })
      
      const { start_dt } = await browser.tabs.sendMessage(
        this.tab_id,
        {
          action: "autoClickStart",
          interval: this.state.interval,
          tab_id: this.tab_id
        }
      )
      
      // Make sure we don't have multiple progress bar animation tasks
      clearInterval(this.progress_animation_id)
      this.startCountAnimation(start_dt)
    }
    else if(this.state.state == "start") {
      const { state: new_state } = await updateEntry(this.tab_id, { state: "stop" })
      this.setState({ state: new_state })

      browser.tabs.sendMessage(this.tab_id, { action: "autoClickStop" })
      clearInterval(this.progress_animation_id)
    }
  }
  
  startCountAnimation(start_dt:number) {
    this.progress_animation_id = setInterval(() => {
      this.getProgressValue(start_dt)
      const progress = this.getProgressValue(start_dt)
      this.setState({ progress })
    }, 100) as any as number
  }
  
  getProgressValue(start_dt:number) {
    const cur_date = new Date()
    const passed_ms = Number(cur_date) - start_dt
    const passed_s = passed_ms / 1000
    const full_circle_value = Number(this.state.interval)
    const progress = (passed_s / full_circle_value) * 100
    return progress
  }
  
  async shakeImg() {
    await browser.tabs.sendMessage(this.tab_id, { action: 'shakeImg' })
  }
}

export default App;