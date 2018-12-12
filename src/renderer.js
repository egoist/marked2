import slugo from 'slugo'
import { escape, unescape } from './utils'

const highlightLinesRe = /{([\d,-]+)}/

export default class Renderer {
  constructor(options) {
    this.options = options || {}
    this._headings = []
  }

  code(code, lang, escaped) {
    let dataLine = ''
    if (this.options.dataLine && lang && highlightLinesRe.test(lang)) {
      dataLine = ` data-line="${highlightLinesRe.exec(lang)[1]}"`
      lang = lang.substr(0, lang.indexOf('{'))
    }

    if (this.options.highlight) {
      const out = this.options.highlight(code, lang)
      if (out !== null && out !== code) {
        escaped = true
        code = out
      }
    }

    if (!lang) {
      return `<pre${dataLine}><code>${escaped
        ? code
        : escape(code, true)}\n</code></pre>`
    }

    return `<pre${dataLine}><code class="${this.options.langPrefix}${escape(
      lang,
      true
    )}">${escaped ? code : escape(code, true)}\n</code></pre>\n`
  }

  blockquote(quote) {
    return `<blockquote>\n${quote}</blockquote>\n`
  }

  html(html) {
    return html
  }

  heading(text, level, raw) {
    let slug = slugo(raw)
    const count = this._headings.filter(h => h === raw).length
    if (count > 0) {
      slug += `-${count}`
    }
    this._headings.push(raw)
    return `<h${level} id="${this.options
      .headerPrefix}${slug}">${text}</h${level}>\n`
  }

  hr() {
    return this.options.xhtml ? '<hr/>\n' : '<hr>\n'
  }

  list(body, ordered, taskList) {
    const type = ordered ? 'ol' : 'ul'
    const classNames = taskList ? ' class="task-list"' : ''
    return `<${type}${classNames}>\n${body}</${type}>\n`
  }

  listitem(text, checked) {
    if (checked === undefined) {
      return `<li>${text}</li>\n`
    }

    return (
      '<li class="task-list-item">' +
      '<input type="checkbox" class="task-list-item-checkbox"' +
      (checked ? ' checked' : '') +
      '> ' +
      text +
      '</li>\n'
    )
  }

  paragraph(text) {
    return `<p>${text}</p>\n`
  }

  table(header, body) {
    return `<table>\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`
  }

  tablerow(content) {
    return `<tr>\n${content}</tr>\n`
  }

  tablecell(content, flags) {
    const type = flags.header ? 'th' : 'td'
    const tag = flags.align
      ? `<${type} style="text-align:${flags.align}">`
      : `<${type}>`
    return `${tag + content}</${type}>\n`
  }

  // span level renderer
  strong(text) {
    return `<strong>${text}</strong>`
  }

  em(text) {
    return `<em>${text}</em>`
  }

  codespan(text) {
    if (this.options.codeSpanHighlighted) {
      const defaultInlineLanguage = 'markup'
      return `<code class="${this.options.langPrefix}${defaultInlineLanguage}">${text}</code>`
    }
    return `<code>${text}</code>`
  }

  br() {
    return this.options.xhtml ? '<br/>' : '<br>'
  }

  del(text) {
    return `<del>${text}</del>`
  }

  link(href, title, text) {
    if (this.options.sanitize) {
      let prot
      try {
        prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase()
      } catch (err) {
        return ''
      }
      if (
        // eslint-disable-next-line no-script-url
        prot.indexOf('javascript:') === 0 ||
        prot.indexOf('vbscript:') === 0 ||
        prot.indexOf('data:') === 0
      ) {
        // eslint-disable-line no-script-url
        return ''
      }
    }
    let out = `<a href="${href}"`
    if (title) {
      out += ` title="${title}"`
    }
    const { linksInNewTab } = this.options
    const targetBlank =
      linksInNewTab === true ||
      (typeof linksInNewTab === 'function' && linksInNewTab(href))
    if (targetBlank) {
      out += ` target="_blank"`
    }
    out += `>${text}</a>`
    return out
  }

  image(href, title, text) {
    let out = `<img src="${href}" alt="${text}"`
    if (title) {
      out += ` title="${title}"`
    }
    out += this.options.xhtml ? '/>' : '>'
    return out
  }

  text(text) {
    return text
  }
}
