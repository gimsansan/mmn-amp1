import type { ImageSourcePropType } from "react-native";

/** 링 6 음소 id. 파일명 001~006과 같음. */
export type Ling6SoundId = "m" | "u" | "a" | "i" | "sh" | "s";

export type Ling6Choice = Ling6SoundId | "silence";

export type Ling6Sound = {
  id: Ling6SoundId;
  /** 화면에 보이는 한글 음소. */
  label: string;
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
    image: require("@/assets/ling6/001.png"),
  },
  {
    id: "u",
    label: "우",
    image: require("@/assets/ling6/002.png"),
  },
  {
    id: "a",
    label: "아",
    image: require("@/assets/ling6/003.png"),
  },
  {
    id: "i",
    label: "이",
    image: require("@/assets/ling6/004.png"),
  },
  {
    id: "sh",
    label: "쉬",
    image: require("@/assets/ling6/005.png"),
  },
  {
    id: "s",
    label: "스",
    image: require("@/assets/ling6/006.png"),
  },
];

export const LING6_SOUND_IDS: readonly Ling6SoundId[] = LING6_SOUNDS.map(
  (sound) => sound.id,
);
