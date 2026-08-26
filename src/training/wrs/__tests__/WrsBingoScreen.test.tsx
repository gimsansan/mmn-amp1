import { render, screen, waitFor } from "@testing-library/react-native";

import { BINGO_CELL_COUNT } from "@/training/wrs/wrsBingo";
import { WrsBingoScreen } from "@/training/wrs/WrsBingoScreen";

jest.mock("expo-router", () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const { useEffect } = jest.requireActual("react");
    useEffect(effect, [effect]);
  },
}));

jest.mock("@/training/wrs/wrsTts", () => ({
  speakWrsWord: jest.fn(async () => undefined),
  stopWrsSpeech: jest.fn(async () => undefined),
}));

describe("WrsBingoScreen", () => {
  it("목록에서 들어오면 idle을 건너뛰고 칸 9개가 그려진다", async () => {
    render(
      <WrsBingoScreen
        onBack={() => undefined}
        autoStart
        initialDifficulty="easy"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("들은 단어를 누르세요")).toBeTruthy();
    });
    const cells = screen
      .getAllByRole("button")
      .filter((node) => node.props.accessibilityLabel?.length === 1);
    expect(cells).toHaveLength(BINGO_CELL_COUNT);
  });
});
