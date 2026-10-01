import {
    fireEvent,
    render,
    waitFor,
} from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

import MoreTab from "@/app/(tabs)/more";

const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
};

jest.mock("expo-router", () => ({
    useRouter: () => mockRouter,
}));

jest.mock("@expo/vector-icons", () => ({
    Ionicons: () => null,
}));

describe("More tab integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
        jest.spyOn(Linking, "openURL").mockResolvedValue(true);
        jest.spyOn(Alert, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders the resident profile", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Jordan Mercer")).toBeTruthy();
        expect(getByText(/The Meridian\s*·\s*Unit 4B/)).toBeTruthy();
        expect(getByText(/Lease ends\s*Aug 31, 2025/)).toBeTruthy();
    });

    it("renders the quick action shortcuts", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Pay rent")).toBeTruthy();
        expect(getByText("Maintenance")).toBeTruthy();
        expect(getByText("Updates")).toBeTruthy();
        expect(getByText("Calendar")).toBeTruthy();
    });

    it("navigates to Pay from the quick action", async () => {
        const { getByRole } = await render(<MoreTab />);

        fireEvent.press(getByRole("button", { name: "Pay rent" }));

        expect(mockRouter.push).toHaveBeenCalledWith("/pay");
    });

    it("navigates to Maintenance from the quick action", async () => {
        const { getByRole } = await render(<MoreTab />);

        fireEvent.press(getByRole("button", { name: "Maintenance" }));

        expect(mockRouter.push).toHaveBeenCalledWith("/maintenance");
    });

    it("navigates to Announcements from the Updates action", async () => {
        const { getByRole } = await render(<MoreTab />);

        fireEvent.press(getByRole("button", { name: "Updates" }));

        expect(mockRouter.push).toHaveBeenCalledWith("/announcements");
    });

    it("navigates to Amenities from the Calendar action", async () => {
        const { getByRole } = await render(<MoreTab />);

        fireEvent.press(getByRole("button", { name: "Calendar" }));

        expect(mockRouter.push).toHaveBeenCalledWith("/amenities");
    });

    it("renders the lease section collapsed initially", async () => {
        const { getByRole, queryByText } = await render(<MoreTab />);

        const leaseButton = getByRole("button", {
            name: /Your lease/,
        });

        expect(leaseButton).toBeTruthy();
        expect(queryByText("142 Riverside Dr")).toBeNull();
    });

    it("expands the lease section", async () => {
        const { getByRole, getByText } = await render(<MoreTab />);

        const leaseButton = getByRole("button", {
            name: /Your lease/,
        });

        fireEvent.press(leaseButton);

        await waitFor(() => {
            expect(getByText("142 Riverside Dr")).toBeTruthy();
            expect(getByText("Monthly rent")).toBeTruthy();
            expect(getByText("Lease is active")).toBeTruthy();
        });
    });

    it("collapses the lease section", async () => {
        const { getByRole, getByText, queryByText } = await render(
            <MoreTab />,
        );

        const leaseButton = getByRole("button", {
            name: /Your lease/,
        });

        fireEvent.press(leaseButton);

        await waitFor(() => {
            expect(getByText("142 Riverside Dr")).toBeTruthy();
        });

        fireEvent.press(leaseButton);

        await waitFor(() => {
            expect(queryByText("142 Riverside Dr")).toBeNull();
        });
    });

    it("renders the documents section", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Documents")).toBeTruthy();
        expect(getByText("6 available documents")).toBeTruthy();
        expect(getByText("Lease Agreement")).toBeTruthy();
        expect(getByText("Community Rules & Policies")).toBeTruthy();
        expect(getByText("Move-In Checklist")).toBeTruthy();
    });

    it("shows only the first three documents initially", async () => {
        const { getByText, queryByText } = await render(<MoreTab />);

        expect(getByText("Lease Agreement")).toBeTruthy();
        expect(getByText("Community Rules & Policies")).toBeTruthy();
        expect(getByText("Move-In Checklist")).toBeTruthy();

        expect(queryByText("Renter's Insurance Requirements")).toBeNull();
        expect(queryByText("Parking & Guest Parking Policy")).toBeNull();
        expect(queryByText("Amenity Rules & Guidelines")).toBeNull();
    });

    it("expands the documents list", async () => {
        const { getByRole, getByText } = await render(<MoreTab />);

        fireEvent.press(
            getByRole("button", {
                name: "See all",
            }),
        );

        await waitFor(() => {
            expect(
                getByText("Renter's Insurance Requirements"),
            ).toBeTruthy();

            expect(
                getByText("Parking & Guest Parking Policy"),
            ).toBeTruthy();

            expect(
                getByText("Amenity Rules & Guidelines"),
            ).toBeTruthy();

            expect(getByText("Show less")).toBeTruthy();
        });
    });

    it("collapses the expanded documents list", async () => {
        const { getByRole, getByText, queryByText } = await render(
            <MoreTab />,
        );

        fireEvent.press(
            getByRole("button", {
                name: "See all",
            }),
        );

        await waitFor(() => {
            expect(
                getByText("Renter's Insurance Requirements"),
            ).toBeTruthy();
        });

        fireEvent.press(
            getByRole("button", {
                name: "Show less",
            }),
        );

        await waitFor(() => {
            expect(
                queryByText("Renter's Insurance Requirements"),
            ).toBeNull();

            expect(
                queryByText("Parking & Guest Parking Policy"),
            ).toBeNull();

            expect(
                queryByText("Amenity Rules & Guidelines"),
            ).toBeNull();
        });
    });

    it("opens the Lease Agreement document", async () => {
        const { getByLabelText } = await render(<MoreTab />);

        fireEvent.press(getByLabelText("Open Lease Agreement"));

        await waitFor(() => {
            expect(Linking.canOpenURL).toHaveBeenCalledWith(
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            );

            expect(Linking.openURL).toHaveBeenCalledWith(
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            );
        });
    });

    it("opens the Community Rules document", async () => {
        const { getByLabelText } = await render(<MoreTab />);

        fireEvent.press(
            getByLabelText("Open Community Rules & Policies"),
        );

        await waitFor(() => {
            expect(Linking.openURL).toHaveBeenCalledWith(
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            );
        });
    });

    it("opens the Move-In Checklist document", async () => {
        const { getByLabelText } = await render(<MoreTab />);

        fireEvent.press(getByLabelText("Open Move-In Checklist"));

        await waitFor(() => {
            expect(Linking.openURL).toHaveBeenCalledWith(
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            );
        });
    });

    it("does not open a document when its URL cannot be handled", async () => {
        jest.spyOn(Linking, "canOpenURL").mockResolvedValue(false);

        const { getByLabelText } = await render(<MoreTab />);

        fireEvent.press(getByLabelText("Open Lease Agreement"));

        await waitFor(() => {
            expect(Linking.canOpenURL).toHaveBeenCalled();
            expect(Linking.openURL).not.toHaveBeenCalled();

            expect(Alert.alert).toHaveBeenCalledWith(
                "Unable to open document",
                expect.stringContaining("Lease Agreement"),
            );
        });
    });

    it("renders the Community section", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Community")).toBeTruthy();
        expect(getByText("Community Calendar")).toBeTruthy();
        expect(getByText("3 upcoming events")).toBeTruthy();
        expect(getByText("Announcements")).toBeTruthy();
        expect(
            getByText("View building updates and notices"),
        ).toBeTruthy();
    });

    it("renders the Account section", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Account")).toBeTruthy();
        expect(getByText("Notification settings")).toBeTruthy();
        expect(getByText("Contact the office")).toBeTruthy();
        expect(getByText("Support & FAQs")).toBeTruthy();
        expect(getByText("Privacy & security")).toBeTruthy();
        expect(getByText("Edit profile")).toBeTruthy();
    });

    it("renders the notification settings summary", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("4 of 4 channels on")).toBeTruthy();
    });

    it("renders the contact office hours", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Mon-Fri 9 am-6 pm")).toBeTruthy();
    });

    it("renders the support summary", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(getByText("Help center")).toBeTruthy();
    });

    it("renders the privacy summary", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(
            getByText("Account and privacy preferences"),
        ).toBeTruthy();
    });

    it("renders the resident contact information", async () => {
        const { getByText } = await render(<MoreTab />);

        expect(
            getByText("(415) 555-0123 · resident@example.com"),
        ).toBeTruthy();
    });

    it("renders the sign out button", async () => {
        const { getByTestId, getByText } = await render(<MoreTab />);

        expect(getByTestId("more-sign-out")).toBeTruthy();
        expect(getByText("Sign out")).toBeTruthy();
    });

    it("opens the sign out confirmation", async () => {
        const { getByTestId } = await render(<MoreTab />);

        fireEvent.press(getByTestId("more-sign-out"));

        expect(Alert.alert).toHaveBeenCalledWith(
            "Sign out",
            expect.any(String),
            expect.any(Array),
        );
    });
});