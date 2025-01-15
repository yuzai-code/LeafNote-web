import {
    CodeBlockLanguageSelector,
    EmojiSelector,
    ImageResizeBar,
    ImageToolBar,
    InlineFormatToolbar,
    Muya,
    ParagraphFrontButton,
    ParagraphFrontMenu,
    ParagraphQuickInsertMenu,
    PreviewToolBar,
    TableColumnToolbar,
    TableDragBar,
    TableRowColumMenu,
    zh,
  } from '@muyajs/core'
  
  // 导入样式
  import '@muyajs/core/lib/style.css'
  import './styles/main.css'
  
  // 注册插件
  Muya.use(EmojiSelector)
  Muya.use(InlineFormatToolbar)
  Muya.use(ImageToolBar)
  Muya.use(ImageResizeBar)
  Muya.use(CodeBlockLanguageSelector)
  Muya.use(ParagraphFrontButton)
  Muya.use(ParagraphFrontMenu)
  Muya.use(TableColumnToolbar)
  Muya.use(ParagraphQuickInsertMenu)
  Muya.use(TableDragBar)
  Muya.use(TableRowColumMenu)
  Muya.use(PreviewToolBar)
  
  // 初始化编辑器
  const container = document.querySelector('#editor')
  const muya = new Muya(container, {
    markdown: '# 欢迎使用 Markdown 编辑器\n\n开始编写你的文档吧！',
  })
  
  // 设置中文语言
  muya.locale(zh)
  
  // 初始化
  muya.init()