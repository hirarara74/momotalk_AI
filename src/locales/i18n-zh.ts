export default {
    selectInfo: '请选择学生',
    relatedStudentTitle: '相关学生',
    noRelatedStudent: '暂无相关学生',
    default: '默认',
    name: '名字',
    school: '学校',
    club: '社团',
    birthday: '生日',
    rare: '稀有度',
    released: '已实装',
    unreleased: '未实装',
    sort: '排序',
    filter: '筛选',
    imageUploadAlert: '目前不建议上传大于 1MB 的图片哦！',
    customRoleInfo: '请输入自定义角色名',
    storyEvent: '羁绊剧情',
    reply: '回复',
    playerTitle: 'MomoTalk 剧情播放器',
    helpTitle: 'MomoTalk AI 使用指南',
    playerContent: '点击 `确定` 开始播放学生 MomoTalk 剧情\n💥注意：此功能会清空对话记录',
    confirm: '确定',
    cancel: '取消',
    selectStory: '选择剧情',
    selectLanguage: '选择语言',
    setting: '设置',
    basicSetting: '基本设置',
    soundEffects: '音效 (SE)',
    soundVolume: 'SE 音量',
    aiSetting: 'AI设置',
    aiEnabled: 'AI自动回复',
    aiProvider: 'AI模型',
    keySecurityReassurance: 'API 密钥仅保存在本地浏览器（localStorage）中，绝不上传任何第三方服务器。',
    sleepRhythm: '作息时间（就寝与起床时间）',
    sleepRhythmDesc: '在深夜等就寝时间内保留消息，并在早晨起床时间（根据学生个性与工作日/休息日）自动回复',
    sleepingBadge: '就寝中 (预计 {time} 起床)',
    sleepingPlaceholder: '{name}正在就寝中（消息将在起床后回复）...',
    readStatus: '已读',
    clearChat: '重置',
    resetChatConfirm: '确定要重置与{name}的对话记录吗？',
    talkWith: '与 {name} 聊天',
    chatInputPlaceholder: '发送消息给 {name}...',
    apiKeyNotConfiguredNotice: '（API密钥尚未设置。请点击右上角设置 ⚙️ 输入API密钥。※ 免费的 Groq API Key 可在 https://console.groq.com/keys 申请）',
    imageMessagePlaceholder: '输入关于图片的消息（可选）...',
    apiKeyPlaceholderGroq: '输入 gsk_...',
    apiKeyPlaceholder: '输入 API Key',
    groqKeyNoticePrefix: '※ 免费的 Groq API Key 可在 ',
    groqKeyNoticeSuffix: ' 申请。',
    geminiKeyNoticePrefix: '※ Gemini API Key 可在 ',
    geminiKeyNoticeSuffix: ' 申请。',
    modelLabel: 'Model (留空为推荐默认)',
    modelPlaceholderGroq: '推荐: qwen/qwen3.8-27b 或 openai/gpt-oss-120b',
    modelPlaceholderGemini: '例: gemini-3.5-flash-lite',
    modelPlaceholderOpenai: '例: gpt-4o-mini',
    modelChipTop120b: '★ 最强旗舰 (120B)',
    modelChipTop120bTitle: '超大型120B思考型模型（CoT深度推理·精细高品质）',
    modelChipStd27b: '标准·图像支持 (27B)',
    modelChipStd27bTitle: '标准模型（支持图像识别·响应轻快）',
    modelChipGeminiPro: '进阶 (3.5-flash)',
    modelChipGeminiLite: '标准 (3.5-flash-lite)',
    customBaseUrlLabel: '自定义 Base URL (可选)',
    filterPromptSupportedOnly: '🤖 仅显示适配Prompt学生',
    filterAllStudents: '👥 显示全部学生',
    back: '返回',
    kizunaRankTitle: '羁绊等级',
    removeImage: '删除附加图片',
    sendSticker: '发送贴图',
    sendImage: '附加并发送图片',
    sharefile: '数据管理',
    renderStyle: '主题样式',
    fullScreen: '窗口全屏',
    zoom: '字体缩放',
    draggable: '对话拖拽',
    enableDrag: '启用拖拽',
    importAndExport: '对话内容文件',
    importButton: '选择文件',
    exportButton: '点我下载',
    sharedFile: '分享文件（可播放对话）',
    warnZoom: 
        "⚠️ 发现您的浏览器处于缩放状态(%ratio%)，继续下载图片可能导致排版错误。\n• 如果需要缩放，请使用右上角设置 ⚙️ 中的缩放功能。\n• 是否要继续下载？",
    help: `
# MomoTalk AI 使用指南 · How to use

这是一款能够与《碧蓝档案》（Blue Archive）的学生们进行实时互动的 AI 对话应用。

## 💬 聊天功能 · Chat Features

- **与学生对话**：选择任意学生，在底部输入栏发送消息，基沃托斯的学生将忠实于原作人设、性格、口吻和人际关系进行回复。
- **输入中动画与已读**：老师发送的消息会显示“已读”，学生思考并组织语言时，会实时播放原作经典的“…”输入动画。
- **生活作息（就寝与起床）**：根据学生的个性与工作日/休息日设定了个性化的作息时间。深夜就寝期间回复将被保留，早晨起床时将自动发送（可在设置中随时开启/关闭）。
- **现实时间、季节与生日感知**：学生知晓现实中的当前时间、星期、季节以及学生自己的生日。
- **消息时间与日期分割线**：每条消息均标注发送时间，不同日期之间显示日期分割线。

## 📸 多模态图像识别 · Image Vision

- **发送图片**：点击输入栏的照片图标即可发送图片或截图（大图将自动压缩优化）。
- **学生真实反馈**：学生会仔细观看图片内容（风景、照片、图表等）并给出真实的情境反应。

## 💖 羁绊等级 · Kizuna Rank

- 与学生持续对话可提升与该学生的羁绊等级（Lv.1 起）。

## 📚 学生列表（支持23名深度设定学生） · Student Roster

- **搜索栏**（快捷键 \`/\`）：支持汉字、拼音、罗马音及昵称快速搜索。
- **筛选**：可按学校、稀有度、实装状态，或仅筛选“🤖 已适配AI提示词的学生（23名）”。
- **排序**：聊天界面按最近交互时间自动置顶排序。
- **差分切换**：带有“+”标记的学生头像可点击切换服装与表情差分。

## ⚙️ 设置 · Settings

- 点击右上角齿轮图标（⚙️）可进行以下自定义设置：
  - **AI 服务商**：Groq（默认高速推荐）/ Google Gemini / OpenAI 兼容 / Anthropic Claude
  - **模型与密钥**：一键切换顶级 120B 推理模型（openai/gpt-oss-120b）或标准图像支持 27B 模型（qwen/qwen3.8-27b）
  - **生活作息**：开启或关闭学生的作息模拟
  - **主题切换**：MomoTalk 原生主题 / YuzuTalk 主题
  - **音效设置**：提示音、升级音效开关及音量调节

## ⌨️ 快捷键 · Shortcuts

- \`/\` : 聚焦搜索框
- \`Enter\` : 发送消息
- \`Shift + Enter\` : 换行

## 📜 致谢与免责声明 · Credits & Disclaimer

### 1. 原作版权与知识产权归属
- 本应用涉及的《碧蓝档案》（Blue Archive）所有角色、立绘图片、世界观设定、商标及知识产权均归 **NEXON Games** 及 **Yostar（上海悠星网络）**（以及各地区发行商）所有。
- 本项目严格遵守官方二次创作指引，是由玩家出于纯粹热爱制作的**非官方、非营利性同人衍生作品**。
- 本项目与 NEXON Games、Yostar 及任何官方运营方均无关联。

### 2. 开源项目致谢
- 本应用的 UI 界面与交互基础框架 Fork 自开源项目 **[U1805/momotalk](https://github.com/U1805/momotalk)**（MIT License / 作者: U1805），在此基础上整合了多模型大语言模型（LLM）对话引擎与多模态视觉识别能力。衷心感谢 U1805 优秀的 MomoTalk 原作还原工程及开源贡献！
- 部分学生数据与素材资源引用自同人数据库项目 **[SchaleDB](https://schaledb.com/)**（[lonqix/SchaleDB](https://github.com/lonqix/SchaleDB)）。

### 3. 基于 Vibe Coding（氛围编程）打造
- 本项目由人类开发者与 Google DeepMind 自主型智能体 AI **Antigravity** 深度协同，通过交互式结对编程（**Vibe Coding**）完成了架构设计、角色深度提示词构建、测试驱动开发（TDD）及自我修正循环（\`//loop\`）。
- 这是一个结合人类创意构想与 AI 智能体工程闭环的实验性 AI-Native 软件范例。

### 4. 隐私安全与免责声明
- **API 密钥安全**：您在设置中填写的 API Key 仅保存在您本地浏览器的 \`localStorage\` 中，绝不会上传或存储到任何开发者中转服务器，直接通过 HTTPS 加密通信直连官方 AI 服务商（如 Groq、Google 等）。
- **免责声明**：作者不承担因使用本应用产生的任何损失或争议。如版权方提出任何合规要求，本项目将第一时间积极配合调整或下线。
`
}
