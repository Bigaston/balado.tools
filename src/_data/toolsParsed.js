const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const parse = require("node-html-parser").parse
const mime = require('mime-types')

const yml = require('js-yaml')

const CACHE_DURATION = 1000 * 60 * 60 * 24 // 1 day

module.exports = async () => {
  return

  let cache;

  if (!fs.existsSync(path.resolve(__dirname, '.generated'))) {
    fs.mkdirSync(path.resolve(__dirname, '.generated'))
  }

  const tools = yml.load(fs.readFileSync(path.resolve(__dirname, './tools.yml'), 'utf8'))

  let parsedTools = []
  let cachedFavicon = {}

  if (fs.existsSync(path.resolve(__dirname, '.generated/cachedFavicon.json'))) {
    cachedFavicon = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.generated/cachedFavicon.json'), 'utf8'))
  }

  for (const tool of tools) {
    console.log("Fetch favicon: " + tool.name)

    if (cachedFavicon[tool.url]) {
      parsedTools.push({
        ...tool,
        favicon: cachedFavicon[tool.url]
      })

      continue
    }

    try {
      const response = await fetch(tool.url)

      if (!response.ok) {
        return 'Error parsing ' + tool.url
      }

      const html = parse(await response.text())
      const favicon = html.querySelector("link[rel='icon']") || html.querySelector("link[rel='shortcut icon']")

      if (!favicon) {
        console.log('No favicon found for ' + tool.url)

        parsedTools.push({
          ...tool,
          favicon: null
        })
      } else {
        const faviconUrl = getFaviconURL(favicon.getAttribute("href"), tool.url) //`${getRoot(tool.url)}${favicon.getAttribute("href")}`

        console.log('Found favicon for ' + tool.url + ': ' + faviconUrl)

        const faviconResponse = await fetch(faviconUrl)

        if (!faviconResponse.ok) {
          console.log('Error fetching favicon for ' + tool.url + ': ' + faviconUrl)

          parsedTools.push({
            ...tool,
            favicon: null
          })
        } else {
          const faviconBuffer = await faviconResponse.buffer()
          const faviconMimeType = mime.lookup(faviconUrl)

          fs.writeFileSync(path.resolve(__dirname, `.generated/favicon-${banalize(tool.url)}.${mime.extension(faviconMimeType)}`), faviconBuffer)

          parsedTools.push({
            ...tool,
            favicon: `/.generated/favicon-${banalize(tool.url)}.${mime.extension(faviconMimeType)}`
          })

          cachedFavicon[tool.url] = `/.generated/favicon-${banalize(tool.url)}.${mime.extension(faviconMimeType)}`
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Copy .generated to _site
  fs.readdirSync(path.resolve(__dirname, '.generated')).forEach(file => {
    fs.copyFileSync(path.resolve(__dirname, `.generated/${file}`), path.resolve(__dirname, `../_site/.generated/${file}`))
  })

  fs.writeFileSync(path.resolve(__dirname, '.generated/cachedFavicon.json'), JSON.stringify(parsedTools))

  console.log(parsedTools)

  return parsedTools
}

function banalize(str) {
  return str.replace(/\//g, "").replace(/\\/g, "").replace(/\./g, "-").replace(/:/g, "").replace("https", "").replace("http", "").toLowerCase()
}

function getRoot(url) {
  return url.split("/")[0] + "//" + url.split("/")[2]
}

function getFaviconURL(faviconPath, url) {
  if (faviconPath.startsWith("http")) {
    return faviconPath
  }

  let domain = getRoot(url)

  if (!faviconPath.startsWith("/")) {
    return domain + "/" + faviconPath
  } else {
    return domain + faviconPath
  }
}