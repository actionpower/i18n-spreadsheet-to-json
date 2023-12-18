import * as i18nFromSpreedSheet from "..";

describe("rawDataToObjectFormatter", () => {
  it("should format nested objects with arrays in Korean", () => {
    const data = [
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
        "Audio",
      ],
      [
        "available.audio.three.tow.depth.value3.age.student.school.1",
        "중학교",
        "Audio",
      ],
      [
        "available.audio.three.tow.depth.value3.age.student.school.2",
        "초등학교",
        "Audio",
      ],
      [
        "available.audio.three.tow.depth.value3.age.student.school.3.type",
        "유치원",
        "Audio",
      ],
      ["array.0.name", "이름"],
      ["array.0.age", "20"],
      ["array.1", "이름2"],
    ];

    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(data, "ko");
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

  it("should format nested objects with arrays in English", () => {
    const data = [
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

    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(data, "en");
    expect(result).toEqual({
      available: {
        title: "Filetypes we support",
        youtube: "YouTube links",
      },
      information: {
        fileUpload: { title: "Click here to select a file or drag & drop." },
      },
      time: {
        insufficientTime: "You need",
        remainTime: "Time remaining",
      },
    });
  });
});

describe("rawDataToObjectFormatter", () => {
  it("배열이 포함되고 중첩된 객체에 대해서 한국어로 formatting을 해줍니다.", () => {
    const data = [
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
        "Audio",
      ],
      [
        "available.audio.three.tow.depth.value3.age.student.school.1",
        "중학교",
        "Audio",
      ],
      [
        "available.audio.three.tow.depth.value3.age.student.school.2",
        "초등학교",
        "Audio",
      ],
      [
        "available.audio.three.tow.depth.value3.age.student.school.3.type",
        "유치원",
        "Audio",
      ],
      ["array.0.name", "이름"],
      ["array.0.age", "20"],
      ["array.1", "이름2"],
    ];

    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(data, "ko");
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
  it("배열이 포함되고 중첩된 객체에 대해서 영어로 formatting을 해줍니다.", () => {
    const data = [
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
      ["array.0.age", "20"],
      ["array.1", "이름2", "name2"],
    ];

    const result = i18nFromSpreedSheet.rawDataToObjectFormatter(data, "en");
    const expected = {
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
                  age: {
                    student: { school: ["A", "B", "C", { type: "D" }] },
                  },
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
    };
    expect(result).toEqual(expected);
  });
});
