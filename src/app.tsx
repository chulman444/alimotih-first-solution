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
      const state = Object.assign(entry, { progress: 50 })
      this.setState(state)
      this.forceUpdate()
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
      
      browser.tabs.sendMessage(
        this.tab_id,
        { action: "autoClickStart", interval: this.state.interval }
      )
      clearInterval(this.progress_animation_id)
      this.progress_animation_id = setInterval(() => {
        const progress = this.state.progress + 10
        this.setState({ progress })
      }, 800) as any as number
    }
    else if(this.state.state == "start") {
      const { state: new_state } = await updateEntry(this.tab_id, { state: "stop" })
      this.setState({ state: new_state })

      browser.tabs.sendMessage(this.tab_id, { action: "autoClickStop" })
      clearInterval(this.progress_animation_id)
    }
  }
  
  async shakeImg() {
    await browser.tabs.sendMessage(this.tab_id, { action: 'shakeImg' })
  }
}

export default App;