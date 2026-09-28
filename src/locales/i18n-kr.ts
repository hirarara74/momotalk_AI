export default {
    selectInfo: '학생을 선택해주세요',
    relatedStudentTitle: '관련 학생',
    noRelatedStudent: '관련 학생이 없습니다',
    default: '기본',
    name: '이름',
    school: '학교',
    club: '동아리',
    birthday: '생일',
    rare: '희귀도',
    released: '실장',
    unreleased: '미실장',
    sort: '정렬',
    filter: '필터',
    imageUploadAlert: '1MB보다 큰 이미지를 업로드하는 것은 권장되지 않습니다!',
    customRoleInfo: '사용자 지정 캐릭터 이름을 입력하세요',
    storyEvent: '이야기 이벤트',
    reply: '답장',
    playerTitle: 'MomoTalk 스토리 플레이어',
    helpTitle: 'MomoTalk AI 이용 가이드',
    playerContent:
        '학생 MomoTalk 이벤트를 시작하려면 `확인`을 클릭하세요\n💥참고: 이로 인해 대화 기록이 지워집니다',
    confirm: '확인',
    cancel: '취소',
    selectStory: '에피소드 선택',
    selectLanguage: '언어 선택',
    setting: '설정',
    basicSetting: '기본 설정',
    soundEffects: '효과음 (SE)',
    soundVolume: 'SE 볼륨',
    aiSetting: 'AI 설정',
    aiEnabled: 'AI 자동 답장',
    aiProvider: 'AI 모델',
    keySecurityReassurance: 'API 키는 브라우저 내부(localStorage)에만 안전하게 보관되며 외부 서버로 전송되지 않습니다.',
    sleepRhythm: '생활 리듬 (취침 및 기상 시간)',
    sleepRhythmDesc: '심야 등 취침 중에는 답장을 보류하고, 아침 기상 시간(학생별 개성 및 평일/휴일)에 맞춰 자동으로 답장합니다',
    sleepingBadge: '취침 중 ({time} 기상 예정)',
    sleepingPlaceholder: '{name} 학생은 취침 중입니다 (메시지는 기상 후 도착합니다)...',
    readStatus: '읽음',
    clearChat: '초기화',
    resetChatConfirm: '{name} 학생과의 대화 기록을 초기화하시겠습니까?',
    talkWith: '{name} 학생과 대화하기',
    chatInputPlaceholder: '{name}에게 메시지 보내기...',
    apiKeyNotConfiguredNotice: '（API 키가 설정되지 않았습니다. 화면 우측 상단의 설정 ⚙️ 에서 API 키를 입력해 주세요. ※ Groq API Key는 https://console.groq.com/keys 에서 무료로 발급받을 수 있습니다）',
    imageMessagePlaceholder: '이미지에 대한 메시지 입력 (생략 가능)...',
    apiKeyPlaceholderGroq: 'gsk_... 입력',
    apiKeyPlaceholder: 'API Key 입력',
    groqKeyNoticePrefix: '※ Groq API Key는 ',
    groqKeyNoticeSuffix: '에서 무료로 발급받을 수 있습니다.',
    geminiKeyNoticePrefix: '※ Gemini API Key는 ',
    geminiKeyNoticeSuffix: '에서 발급받을 수 있습니다.',
    modelLabel: 'Model (공란 시 추천 기본값)',
    modelPlaceholderGroq: '추천: qwen/qwen3.8-27b 또는 openai/gpt-oss-120b',
    modelPlaceholderGemini: '예: gemini-3.5-flash-lite',
    modelPlaceholderOpenai: '예: gpt-4o-mini',
    modelChipTop120b: '★ 최상위 모델 (120B)',
    modelChipTop120bTitle: '초대형 120B 사고형 모델 (CoT 추론·심층 고정밀)',
    modelChipStd27b: '표준·이미지 대응 (27B)',
    modelChipStd27bTitle: '표준 모델 (이미지 인식 지원·경쾌)',
    modelChipGeminiPro: '상위 (3.5-flash)',
    modelChipGeminiLite: '표준 (3.5-flash-lite)',
    customBaseUrlLabel: 'Custom Base URL (선택)',
    filterPromptSupportedOnly: '🤖 프롬프트 지원 학생만',
    filterAllStudents: '👥 전체 학생 표시',
    back: '뒤로 가기',
    kizunaRankTitle: '인연 랭크',
    removeImage: '첨부 이미지 삭제',
    sendSticker: '스티커 전송',
    sendImage: '이미지 첨부 및 전송',
    sharefile: '데이터 관리',
    renderStyle: '테마 스타일',
    fullScreen: '창 전체 화면',
    zoom: '확대/축소',
    draggable: '대화 드래그',
    enableDrag: '드래그 사용',
    importAndExport: '대화 내용 파일',
    importButton: '파일 선택',
    exportButton: '다운로드',
    sharedFile: '파일 공유 (재생 가능한 대화)',
    warnZoom: 
        "⚠️ 현재 브라우저가 확대되어 있습니다(%ratio%). 이미지를 다운로드하면 서식이 오류가 발생할 수 있습니다. \n• 확대가 필요한 경우, 오른쪽 상단의 설정 ⚙️ 에서 확대 기능을 사용하십시오. \n• 계속해서 다운로드하시겠습니까?",
    help: `
# 모모톡 AI 이용 가이드 · How to use

블루 아카이브의 학생들과 실시간으로 대화할 수 있는 대화형 AI 채팅 웹 애플리케이션입니다.

## 💬 대화 기능 · Chat Features

- **학생과의 대화**: 학생을 선택하고 하단 입력창에서 메시지를 전송하면, 키보토스의 학생이 고유의 성격, 말투, 인간관계에 맞추어 답장합니다.
- **입력 중 애니메이션 & 읽음 표시**: 선생님이 보낸 메시지에는 '읽음' 표시가 붙으며, 학생이 답장을 고민하는 동안 원작 특유의 '…' 입력 애니메이션이 실시간으로 표시됩니다.
- **생활 리듬 (취침 및 기상)**: 학생 개개인의 개성과 평일/휴일에 따른 취침 및 기상 일정이 적용되어 있습니다. 심야 취침 중에는 답장이 보류되며, 아침 기상 시간에 맞춰 자동으로 답장이 도착합니다 (설정에서 ON/OFF 가능).
- **날짜, 시간, 계절 및 생일 인식**: 학생들은 현실의 날짜, 시간, 요일, 계절 및 학생 본인의 생일을 정확히 인지하고 있습니다.
- **메시지 전송 시각 & 날짜 구분선**: 각 메시지마다 전송 시각과 날짜 구분선이 표시됩니다.

## 📸 이미지 인식 (멀티모달) · Image Vision

- **사진 전송**: 하단 사진 아이콘을 통해 이미지나 스크린샷을 전송할 수 있습니다 (대용량 이미지도 자동 최적화 전송).
- **학생의 반응**: 학생이 이미지의 실제 내용(풍경, 사진 등)을 직접 보고 감상과 반응을 들려줍니다.

## 😊 스티커 · Stickers

- **스티커 전송**: 입력창 왼쪽 아이콘으로 스티커 목록을 열고 탭하여 전송할 수 있습니다. 아래의 「1」「2」 버튼으로 페이지를 전환합니다.
- **학생의 반응**: 학생은 보낸 스티커의 의미(「OK」「축하해」「고마워」, 놀람·부끄러움·한숨 같은 표정과 감정)를 이해하고 그에 맞는 답장을 보내줍니다.

## 💖 인연 랭크 · Kizuna Rank

- 학생과 꾸준히 대화를 나누면 인연 랭크(Lv.1~)가 상승합니다.

## 📚 학생 목록 (23명 지원) · Student Roster

- **검색창** (\`/\`): 학생 이름(한글, 한자, 로마자 등)으로 빠르게 검색할 수 있습니다.
- **필터**: 학교, 레어도, 실장 여부 외에 '🤖 프롬프트 지원 학생 (23명)'만 모아볼 수 있습니다.
- **정렬**: 채팅 화면에서는 최근 대화를 나눈 순서로 자동 정렬됩니다.
- **표정/복장 차분**: '+' 표시가 있는 학생 아이콘을 클릭하여 표정이나 복장을 전환할 수 있습니다.

## ⚙️ 설정 · Settings

- 우측 상단 톱니바퀴 아이콘(⚙️)에서 다음 항목을 설정할 수 있습니다:
  - **AI 모델 제공자**: Groq (기본 고속·추천) / Google Gemini / OpenAI 호환 / Anthropic Claude
  - **모델 및 API 키**: 최상위 120B 모델(openai/gpt-oss-120b) 및 표준 이미지 지원 27B 모델(qwen/qwen3.8-27b) 원클릭 전환
  - **생활 리듬**: 학생의 취침 및 기상 스케줄 적용 여부 (ON/OFF)
  - **효과음 (SE)**: 알림음, 랭크업 사운드 ON/OFF 및 볼륨 조절

## ⌨️ 단축키 · Shortcuts

- \`/\` : 검색창 포커스
- \`Enter\` : 메시지 전송
- \`Shift + Enter\` : 줄바꿈

## 📜 크레딧 및 가이드라인 · Credits & Disclaimer

### 1. 원작 저작권 및 지식재산권 귀속
- 본 웹 애플리케이션에 등장하는 『블루 아카이브 (Blue Archive)』의 모든 캐릭터, 이미지, 세계관, 상표 등 지식재산권 및 저작권은 **(주)넥슨게임즈(NEXON Games)** 및 **(주)요스타(Yostar)**(및 각 지역 퍼블리셔)에 귀속됩니다.
- 본 애플리케이션은 공식 2차 창작 가이드라인을 준수하며, 팬이 개인 취미로 제작한 **비공식·비영리 2차 창작 팬메이드 웹 애플리케이션**입니다.
- 공식 제작사 및 운영사와는 일절 무관합니다.

### 2. 원본 오픈소스 프로젝트 크레딧
- 본 프로젝트의 UI 및 기본 프레임워크는 오픈소스 프로젝트 **[U1805/momotalk](https://github.com/U1805/momotalk)**(MIT License / 제작자: U1805 님)의 코드를 포크 및 확장하여 AI 대화 엔진과 멀티모달 기능을 통합 구현하였습니다. 훌륭한 MomoTalk UI와 오픈소스 기여에 깊이 감사드립니다.
- 학생 데이터 및 에셋 일부는 팬 커뮤니티 프로젝트인 **[SchaleDB](https://schaledb.com/)**([lonqix/SchaleDB](https://github.com/lonqix/SchaleDB))의 데이터를 참조·활용하였습니다.

### 3. 바이브 코딩 (Vibe Coding)을 통한 제작
- 본 프로젝트는 Google DeepMind의 자율형 에이전트 AI인 **Antigravity**를 페어 프로그래밍 파트너로 삼아, 대화형 코딩(**바이브 코딩 / Vibe Coding**) 방식으로 기능 기획, 프롬프트 엔지니어링, TDD(테스트 주도 개발), 코드 구현 및 성능 최적화를 진행하였습니다.

### 4. 보안 및 면책 조항
- **API 키 보안**: 사용자가 입력한 API 키는 사용자의 브라우저 로컬 저장소(\`localStorage\`)에만 안전하게 보관되며, 개발자나 외부 서버로 수집·전송되지 않습니다.
- **면책 조항**: 본 서비스 이용으로 발생하는 모든 문제나 손해에 대해 제작자는 책임을 지지 않습니다. 원작 권리사의 요청이나 가이드라인 변경이 있을 경우, 즉시 공개 중단 또는 수정 조치를 취합니다.
`
}
