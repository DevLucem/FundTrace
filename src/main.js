import App from './App.svelte'

Number.prototype.toCurrency = function () {
  return this.toLocaleString("en-US", {maximumFractionDigits: 8});
}

const app = new App({
  target: document.getElementById('app')
})

export default app
