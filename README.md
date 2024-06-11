[English](#english) | [한국어](#한국어)

# English

# 🌐 i18n-spreadsheet-to-json

Provides functionality to parse Google Sheets data and generate and synchronize JSON files. Helps with internationalization (i18n) for applications supporting multiple languages.

Google Sheets 데이터를 파싱하여 JSON 파일을 생성 및 동기화하는 기능을 제공합니다.
여러 언어를 지원하는 애플리케이션을 위한 국제화(i18n)를 도와줍니다.

## Installation

```bash
npm install @actionpower/i18n-spreadsheet-to-json --save-dev
```

```bash
yarn add @actionpower/i18n-spreadsheet-to-json --dev
```

## Usage

### i18nconfig.json

Library configuration is done in the i18nconfig.json file.

Create i18nconfig.json at the root path.

```js
//example
{
  "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY",
  "GOOGLE_SHEET_ID": "YOUR_GOOGLE_SHEET_ID",
  "targetDir": "./locales",
  "languages": ["ko", "en", "zh"]
}

```

| Variable            | Description                                                                                                                                                                | Required | Default      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ |
| **GOOGLE_API_KEY**  | API key for using Google Sheets API. [How to get it](https://developers.google.com/maps/documentation/javascript/get-api-key)                                              | required | -            |
| **GOOGLE_SHEET_ID** | 데 ID of the Google Sheets document to fetch data from. You can find it in the spreadsheet's URL. docs.google.com/spreadsheets/d/<b>[GOOGLE_SHEET_ID]</b>/edit?usp=sharing | required | -            |
| **targetDir**       | Directory path where the parsed JSON files will be saved.                                                                                                                  | required | -            |
| **languages**       | Array of supported language codes. JSON files corresponding to each language code will be created in targetDir.                                                            | optional | ["ko", "en"] |

### Execution

Use the following command in the terminal to update all sheets:

```bash
npm run i18n
```

```bash
yarn i18n
```

If you specify a sheet name, only the sheet corresponding to that name will be updated.

```bash
npm run i18n [sheetName]
```

```bash
yarn i18n [sheetName]
```

## Example

- Create a spreadsheet.

<I>⚠Ensure that the sharing access permission is set to "Anyone with the link" (Viewer). If it is set to restricted, API requests will not be possible.</I>
<img width="841" alt="스크린샷 2024-03-07 오후 3 09 22" src="https://github.com/actionpower/i18n-spreadsheet-to-json/assets/148043951/e6364bfc-d998-4772-b123-90e6143a12d2">

- Open the terminal in your project directory and run the `yarn i18n [sheetName]` command. A JSON file will be created in the targetDir specified in the `i18nconfig.json` file.

<b>./locales/ko/person.json</b>

```js
{
  "person": {
    "address": "서울특별시 종로구 사직로 161",
    "hobbies": ["독서", "수영", "악기 연주"]
  }
}
```

<b>./locales/en/person.json</b>

```js
{
  "person": {
    "address": "161 Sajik-ro, Jongno-gu, Seoul, South Korea",
    "hobbies": ["Reading", "Swimming", "Playing an instrument"]
  }
}
```

<b>./locales/zh/person.json</b>

```js
{
  "person": {
    "address": "韩国首尔特别市鐘路區社稷路161号",
    "hobbies": ["阅读", "游泳", "演奏乐器"]
  }
}

```

# 한국어

## 설치

```bash
npm install @actionpower/i18n-spreadsheet-to-json --save-dev
```

```bash
yarn add @actionpower/i18n-spreadsheet-to-json --dev
```

## 사용법

### i18nconfig.json

라이브러리 설정은 i18nconfig.json 파일에서 이루어집니다.

루트 경로에 i18nconfig.json을 생성합니다.

```js
//example
{
  "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY",
  "GOOGLE_SHEET_ID": "YOUR_GOOGLE_SHEET_ID",
  "targetDir": "./locales",
  "languages": ["ko", "en", "zh"]
}

```

| 변수                | 설명                                                                                                                                                                   | 필수 여부 | 기본값       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------ |
| **GOOGLE_API_KEY**  | Google Sheets API를 사용하기 위한 API 키입니다. [발급방법](https://developers.google.com/maps/documentation/javascript/get-api-key)                                    | required  | -            |
| **GOOGLE_SHEET_ID** | 데이터를 가져올 Google Sheets 문서의 ID입니다. spreadSheets의 url을 통해 ID를 알 수 있습니다. docs.google.com/spreadsheets/d/<b>[GOOGLE_SHEET_ID]</b>/edit?usp=sharing | required  | -            |
| **targetDir**       | 파싱된 JSON 파일이 저장될 디렉토리 경로입니다.                                                                                                                         | required  | -            |
| **languages**       | 지원하는 언어 코드의 배열입니다. 각 언어 코드에 해당하는 JSON 파일이 targetDir에 생성됩니다.                                                                           | optional  | ["ko", "en"] |

### 실행

터미널에서 아래의 명령어를 이용해 모든 스프레드 시트를 업데이트할 수 있습니다.

```bash
npm run i18n
```

```bash
yarn i18n
```

sheetName에 특정 시트 이름을 넣어 실행하면 sheetName에 해당하는 시트만 업데이트 됩니다.

```bash
npm run i18n [sheetName]
```

```bash
yarn i18n [sheetName]
```

## Example

- 스프레드 시트를 작성합니다.

<I>⚠공유 엑세스 권한이 링크가 있는 모든 사용자(뷰어)로 되어있는지 확인해주세요. 제한됨으로 되어있으면 api 요청이 불가능합니다.</I>
<img width="841" alt="스크린샷 2024-03-07 오후 3 09 22" src="https://github.com/actionpower/i18n-spreadsheet-to-json/assets/148043951/e6364bfc-d998-4772-b123-90e6143a12d2">

- 프로젝트 경로에서 터미널을 열고 `yarn i18n [sheetName]` 명령어를 입력하면 `i18nconfig.json` 파일에 지정한 `targetDir` 경로에 `[sheetName].json`파일이 생성됩니다.

<b>./locales/ko/person.json</b>

```js
{
  "person": {
    "address": "서울특별시 종로구 사직로 161",
    "hobbies": ["독서", "수영", "악기 연주"]
  }
}
```

<b>./locales/en/person.json</b>

```js
{
  "person": {
    "address": "161 Sajik-ro, Jongno-gu, Seoul, South Korea",
    "hobbies": ["Reading", "Swimming", "Playing an instrument"]
  }
}
```

<b>./locales/zh/person.json</b>

```js
{
  "person": {
    "address": "韩国首尔特别市鐘路區社稷路161号",
    "hobbies": ["阅读", "游泳", "演奏乐器"]
  }
}

```
