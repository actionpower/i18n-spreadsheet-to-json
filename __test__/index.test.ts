import * as i18nFromSpreedSheet from "..";

describe("rawDataToObjectFormatter", () => {
  const testData = [
    [
      "information.fileUpload.title",
      "내 파일을 클릭하거나 끌어오세요",
      "Click here to select a file or drag & drop.",
    ],
    ["time.insufficientTime", "부족한 시간", "You need"],
    ["time.remainTime", "사용 후 남은 시간", "Time remaining"],
    ["available.title", "업로드 가능한 파일", "Filetypes we support"],
    ["available.youtube", "YouTube 링크", "YouTube links"],
    ["available.video", "비디오", "Video"],
    ["available.audio.one", "오디오1", "Audio"],
    ["available.audio.two", "오디오2", "Audio"],
    ["available.audio.three.tow.depth.value", "value", "Audio"],
    ["available.audio.three.tow.depth.value2", "value2", "Audio"],
    ["available.audio.three.tow.depth.value3.name", "name", "Audio"],
    [
      "available.audio.three.tow.depth.value3.age.student.school.0",
      "대학교",
      "A",
    ],
    [
      "available.audio.three.tow.depth.value3.age.student.school.1",
      "중학교",
      "B",
    ],
    [
      "available.audio.three.tow.depth.value3.age.student.school.2",
      "초등학교",
      "C",
    ],
    [
      "available.audio.three.tow.depth.value3.age.student.school.3.type",
      "유치원",
      "D",
    ],
    ["array.0.name", "이름", "name"],
    ["array.0.age", "20", ""],
    ["array.1", "이름2", "name2"],
  ];

  const simpleTestData = [
    [
      "information.fileUpload.title",
      "내 파일을 클릭하거나 끌어오세요",
      "Click here to select a file or drag & drop.",
    ],
    ["time.insufficientTime", "부족한 시간", "You need"],
    ["time.remainTime", "사용 후 남은 시간", "Time remaining"],
    ["available.title", "업로드 가능한 파일", "Filetypes we support"],
    ["available.youtube", "YouTube 링크", "YouTube links"],
  ];

  it("키 경로가 점(.)으로 구분된 평면 배열을 중첩된 객체 구조로 변환합니다 (한국어)", () => {
    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(
      simpleTestData,
      "ko"
    );

    expect(result).toEqual({
      available: { title: "업로드 가능한 파일", youtube: "YouTube 링크" },
      information: { fileUpload: { title: "내 파일을 클릭하거나 끌어오세요" } },
      time: {
        insufficientTime: "부족한 시간",
        remainTime: "사용 후 남은 시간",
      },
    });
  });

  it("언어 코드에 따라 적절한 열의 값을 선택합니다 (영어)", () => {
    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(
      simpleTestData,
      "en"
    );

    expect(result).toEqual({
      available: { title: "Filetypes we support", youtube: "YouTube links" },
      information: {
        fileUpload: { title: "Click here to select a file or drag & drop." },
      },
      time: { insufficientTime: "You need", remainTime: "Time remaining" },
    });
  });

  it("복잡한 중첩 객체와 배열을 올바르게 구성합니다 (한국어)", () => {
    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(testData, "ko");

    expect(result).toEqual({
      available: {
        audio: {
          one: "오디오1",
          two: "오디오2",
          three: {
            tow: {
              depth: {
                value: "value",
                value2: "value2",
                value3: {
                  name: "name",
                  age: {
                    student: {
                      school: [
                        "대학교",
                        "중학교",
                        "초등학교",
                        { type: "유치원" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        title: "업로드 가능한 파일",
        video: "비디오",
        youtube: "YouTube 링크",
      },
      information: { fileUpload: { title: "내 파일을 클릭하거나 끌어오세요" } },
      time: {
        insufficientTime: "부족한 시간",
        remainTime: "사용 후 남은 시간",
      },
      array: [{ name: "이름", age: "20" }, "이름2"],
    });
  });

  it("복잡한 중첩 객체와 배열을 올바르게 구성합니다 (영어)", () => {
    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(testData, "en");

    expect(result).toEqual({
      array: [{ age: "", name: "name" }, "name2"],
      available: {
        audio: {
          one: "Audio",
          three: {
            tow: {
              depth: {
                value: "Audio",
                value2: "Audio",
                value3: {
                  age: { student: { school: ["A", "B", "C", { type: "D" }] } },
                  name: "Audio",
                },
              },
            },
          },
          two: "Audio",
        },
        title: "Filetypes we support",
        video: "Video",
        youtube: "YouTube links",
      },
      information: {
        fileUpload: { title: "Click here to select a file or drag & drop." },
      },
      time: { insufficientTime: "You need", remainTime: "Time remaining" },
    });
  });

  it("빈 데이터 배열이 제공되면 빈 객체를 반환합니다", () => {
    const result = i18nFromSpreedSheet.rawDataToObjectFormatter([], "ko");

    expect(result).toEqual({});
  });

  it("중복된 키 경로가 있을 경우 마지막 값으로 덮어씁니다", () => {
    const duplicateKeysData = [
      ["user.name", "홍길동", "John Doe"],
      ["user.name", "김철수", "Jane Smith"],
    ];

    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(
      duplicateKeysData,
      "ko"
    );

    expect(result).toEqual({ user: { name: "김철수" } });
  });

  it("배열 인덱스가 순차적이지 않은 경우에도 올바르게 구성합니다", () => {
    const nonSequentialArrayData = [
      ["items.0", "첫 번째", "First"],
      ["items.2", "세 번째", "Third"],
      ["items.5", "여섯 번째", "Sixth"],
    ];

    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(
      nonSequentialArrayData,
      "ko"
    );

    expect(result).toEqual({
      items: [
        "첫 번째",
        undefined,
        "세 번째",
        undefined,
        undefined,
        "여섯 번째",
      ],
    });
  });
});
