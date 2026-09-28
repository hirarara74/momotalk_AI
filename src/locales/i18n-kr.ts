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
    sharefile: '대화 & 대화',
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
  - **테마 전환**: MomoTalk 테마 / YuzuTalk 테마
  - **효과음 (SE)**: 알림음, 랭크업 사운드 ON/OFF 및 볼륨 조절

## ⌨️ 단축키 · Shortcuts

- \`/\` : 검색창 포커스
- \`Enter\` : 메시지 전송
- \`Shift + Enter\` : 줄바꿈
`
}
