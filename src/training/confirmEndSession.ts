import { Alert } from "react-native";

/** 끝내기·중지 오탭 방지. 확인 시에만 onConfirm. */
export function confirmEndSession(onConfirm: () => void): void {
  Alert.alert(
    "연습 끝내기",
    "여기서 끝낼까요? 진행 중인 내용은 여기서 마무리돼요.",
    [
      { text: "취소", style: "cancel" },
      { text: "끝내기", style: "destructive", onPress: onConfirm },
    ],
  );
}
