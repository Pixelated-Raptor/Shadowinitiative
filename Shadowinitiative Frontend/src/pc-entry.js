import { mount } from 'svelte'
import PCTable from './lib/PC-Table.svelte'

mount(PCTable, {
  target: document.getElementById('pc-app')
})