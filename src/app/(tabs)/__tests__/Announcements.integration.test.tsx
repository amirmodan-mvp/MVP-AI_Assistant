import {
    fireEvent,
    render,
} from "@testing-library/react-native";
import { router } from "expo-router";

import { ANNOUNCEMENTS } from "@/data/apartment";
import AnnouncementsScreen from "../../announcements";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock("@/components/SeverityBar", () => ({
  SeverityBar: () => null,
}));

describe("Announcements page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the announcements screen", async () => {
    const { getByText } = await render(<AnnouncementsScreen />);

    expect(getByText("Announcements")).toBeTruthy();
    expect(getByText("Updates from your property")).toBeTruthy();
  });

  it("renders every announcement", async () => {
    const { getByText } = await render(<AnnouncementsScreen />);

    ANNOUNCEMENTS.forEach((announcement) => {
      expect(getByText(announcement.title)).toBeTruthy();
      expect(getByText(announcement.body)).toBeTruthy();
      expect(getByText(announcement.date)).toBeTruthy();
    });
  });

  it("navigates back when the back button is pressed", async () => {
    const { getByTestId } = await render(<AnnouncementsScreen />);

    fireEvent.press(getByTestId("announcements-back-button"));

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
