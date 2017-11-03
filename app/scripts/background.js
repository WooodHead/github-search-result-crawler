import 'chromereload/devonly'

var totalPage = 5
var count = totalPage
var delay = 3000

var doScrap = false
var currentTabID = null
var step = 1
var result = []

function injectJS(t) {
  count--
  chrome.browserAction.setBadgeText({
    text: count.toString()
  })

  if (!t) {
    chrome.tabs.query({ 'active': true },
      function(tabs) {
        var tab = tabs[0]
        currentTabID = tab.id
        chrome.tabs.executeScript(tab.id, { file: "scripts/extractor.js" })
      })
  } else {
    chrome.tabs.executeScript(t.id, { file: "scripts/extractor.js" })
  }
}

function startScrap() {
  doScrap = true
  injectJS()
}

function stopScrap() {
  currentTabID = null
  count = totalPage
  doScrap = false
  chrome.browserAction.setBadgeText({
    text: ``
  })
}

function addMessageListener() {
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action === 'links') {
      var links = msg.data
      result = result.concat(links)
      console.log('result', result)
      console.log('sender', sender)

      var tab = sender.tab
      var url = tab.url
      var re = /\?p=(\d+)/
      var match = tab.url.match(re)
      var start = 0
      var newStart = step
      if (match) {
        start = match[1]
        newStart = Number(start) + step
        url = url.replace(re, '?p=' + newStart)
      } else {
        newStart = Number(start) + step
        url = url + '&p=' + newStart
      }

      chrome.tabs.update(tab.id, { url: url });
      if (doScrap && count > 0) {
        setTimeout(function() {
          injectJS(tab)
        }, delay);

      } else {
        stopScrap()
      }
    }
  })
}

function toggleScrap() {
  if (!doScrap) {
    result = []
    startScrap()
  } else {
    stopScrap()
  }
}

function addClickListener() {
  chrome.browserAction.onClicked.addListener(function() {
    toggleScrap()
  })
}

function addActivateListener() {
  chrome.tabs.onActivated.addListener(function() {
    stopScrap()
  })
}

function main() {
  addClickListener()
  addMessageListener()
  // addActivateListener()
}

main()