Google Sheets를 활용하여 여러 언어를 지원하는 애플리케이션을 위한 국제화(i18n)를 도와줍니다.

### 설치

```bash
npm install i18n-spreadsheet-to-json --save-dev
```

```bash
yarn add i18n-spreadsheet-to-json --dev
```

## 사용법

### i18nconfig.json

라이브러리 설정은 i18nconfig.json 파일에서 이루어집니다.

루트 경로에 i18nconfig.json을 생성합니다.

```js
{
  "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY",
  "GOOGLE_SHEET_ID": "YOUR_GOOGLE_SHEET_ID",
  "targetDir": "./locales",
  "languages": ["ko", "en"] //languages는 optional 값이며 ["ko", "en"]이 기본 값 입니다
}

```

- GOOGLE_API_KEY: Google Sheets API를 사용하기 위한 API 키입니다.
- GOOGLE_SHEET_ID: 데이터를 가져올 Google Sheets 문서의 ID입니다.
- targetDir: 파싱된 JSON 파일이 저장될 디렉토리 경로입니다.
- languages: 지원하는 언어 코드의 배열입니다. 각 언어 코드에 해당하는 JSON 파일이 targetDir에 생성됩니다.

### 실행

터미널에서 아래의 명령어를 이용해 모든 스프레드 시트를 업데이트할 수 있습니다.

```bash
i18n
````

특정 시트만 업데이트하려면, sheetName에 원하는 시트 이름을 지정하여 아래와 같이 명령어를 실행합니다.

```bash
i18n sheetName
```



