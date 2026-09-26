<h1 align="center">MomoTalk AI</h1>

<div align="center">
    <img src="https://img.shields.io/github/last-commit/hirarara74/momotalk_AI/main">
    <img src="https://img.shields.io/github/languages/top/hirarara74/momotalk_AI">
    <img src="https://img.shields.io/badge/AI-Groq%20%7C%20Gemini%20%7C%20OpenAI%20%7C%20Claude-blue">
    <img src="https://img.shields.io/badge/%E5%AD%A6%E7%94%9F%E6%95%B0-23%E4%BD%8D-pink">
</div>

<div align="center">
  <strong>基于《蔚蓝档案》MomoTalk 界面的沉浸式 AI 对话 Web 应用</strong><br>
  <sub>与基沃托斯的 23 位学生在最新大语言模型驱动下展开实时互动！</sub>
</div>

<br>

[English](../README.md) | [简体中文](./README-zh_cn.md) | [繁體中文](./README-zh_tw.md) | [日本語](./README-ja.md)

---

## 🌟 主要特性

- 🤖 **23 位学生深度角色扮演**: 支持 23 位《蔚蓝档案》学生，深度还原第一人称口吻、对老师的称呼与距离感、学生人际关系网络与口癖。
- ⚡ **超高速可插拔 AI 引擎**: 默认搭载超快速推理 **Groq**（支持 `openai/gpt-oss-120b`、`qwen/qwen3.8-27b` 等），并可在设置中一键切换至 **Google Gemini**、**OpenAI 兼容接口** 或 **Anthropic Claude**。
- 🌙 **真实作息与睡眠节律模拟**: 模拟学生独特的作息时间（区分工作日/休息日起床时间，以及规律/作息不规律习惯）。学生入睡后消息自动排队，醒来时主动回复（可在设置中自由开关）。
- 💬 **还原原版 MomoTalk 体验**: 逼真的“...”正在输入动效、自然打字节奏、老师消息的“已读”状态标记、时间戳与日期分割线。
- 📸 **多模态图像识别**: 支持向学生发送图片或截图，学生能辨识图像内容并做出贴合人设的个性化反应。
- 💖 **羁绊等级系统**: 与学生日常对话累积亲密度提升羁绊等级，伴有专属羁绊升级音效。
- 🌐 **五国语言国际化**: 完整支持简体中文、繁体中文、日语、英语、韩语的界面与帮助说明。
- 🖼️ **长截图一键导出**: 侧边栏专属保存按钮，一键将聊天记录导出为高清 PNG 图片。
- 📱 **响应式适配**: 完美自适应桌面宽屏与移动端竖屏操作。

---

## 📸 预览

![学生选择](./assets/演示1.webp)
![聊天界面](./assets/演示2.webp)

---

## 🚀 快速开始

### 源码仓库
- GitHub: [hirarara74/momotalk_AI](https://github.com/hirarara74/momotalk_AI)

### 本地部署与运行

```bash
# 克隆仓库
git clone https://github.com/hirarara74/momotalk_AI.git
cd momotalk_AI

# 安装依赖
npm install

# 启动本地开发服务
npm run dev

# 运行单元测试
npm test

# 生产环境打包
npm run build
```

---

## 📖 使用说明

详细操作与键盘快捷键请查阅 [使用说明](./How-to-use-zh_cn.md) 或点击网页右上角的 **`?`** 帮助按钮。

---

## 💖 鸣谢

本项目基于 U1805 创作的开源对话生成器 [U1805/momotalk](https://github.com/U1805/momotalk) 架构发展并扩展了 AI 实时互动功能。

学生数据与素材来源:
- [kivo.wiki](https://kivo.wiki/)
- [ba.gamekee](https://ba.gamekee.com/)
- [bluearchive.fandom](https://bluearchive.fandom.com)

---

## ⚖️ 版权与免责声明

本项目为粉丝自制的非官方开源项目，**与 Yostar 及 NEXON Games 无任何官方关联**。

《蔚蓝档案》的所有角色、图像、音频、商标等知识产权均归属 NEXON Games 及 Yostar 所有。