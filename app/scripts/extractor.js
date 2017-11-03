var links = document.querySelectorAll('.code-list-item .d-inline-block>a:first-of-type')
var urls = Array.prototype.map.call(links, function(item) {
  return item.href
})
var msg = {
  action: "links",
  data: urls
}
chrome.runtime.sendMessage(msg)
console.log('links', links)