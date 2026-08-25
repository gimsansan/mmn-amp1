import type { ImageSourcePropType } from "react-native";

/** 링 6 음소 id. 파일명 001~006과 같음. */
export type Ling6SoundId = "m" | "u" | "a" | "i" | "sh" | "s";

export type Ling6Choice = Ling6SoundId | "silence";

export type Ling6Sound = {
  id: Ling6SoundId;
  /** 화면에 보이는 한글 음소. */
  label: string;
  /** 그리드·변화 문구용 IPA. */
  ipa: string;
  image: ImageSourcePropType;
};

/**
 * 그림 격자 고정 순서(001~006).
 * 재생 순서는 세션이 섞고, 고르는 칸 위치는 바꾸지 않는다.
 */
export const LING6_SOUNDS: readonly Ling6Sound[] = [
  {
    id: "m",
    label: "음",
    ipa: "m",
    image: require("@/assets/ling6/001.webp"),
  },
  {
    id: "u",
    label: "우",
    ipa: "u",
    image: require("@/assets/ling6/002.webp"),
  },
  {
    id: "a",
    label: "아",
    ipa: "a",
    image: require("@/assets/ling6/003.webp"),
  },
  {
    id: "i",
    label: "이",
    ipa: "i",
    image: require("@/assets/ling6/004.webp"),
  },
  {
    id: "sh",
    label: "쉬",
    ipa: "ʃ",
    image: require("@/assets/ling6/005.webp"),
  },
  {
    id: "s",
    label: "스",
    ipa: "s",
    image: require("@/assets/ling6/006.webp"),
  },
];

export const LING6_SOUND_IDS: readonly Ling6SoundId[] = LING6_SOUNDS.map(
  (sound) => sound.id,
);
