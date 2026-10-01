import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    fireEvent,
    render,
    waitFor,
} from "@testing-library/react-native";

import MaintenanceTab from "../maintenance";

const STORAGE_KEY = "@mvp_apartment_maintenance";

jest.mock("@expo/vector-icons", () => ({
    Ionicons: () => null,
}));

jest.mock("@/components/StatusBadge", () => ({
    StatusBadge: ({ label }: { label: string }) => {
        const { Text } = require("react-native");

        return <Text>{label}</Text>;
    },
}));

describe("Maintenance integration", () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        jest.clearAllMocks();
    });

    async function renderMaintenance() {
        const result = await render(<MaintenanceTab />);

        await waitFor(() => {
            expect(result.getByText("Maintenance")).toBeTruthy();
        });

        return result;
    }

    async function openNewRequest(
        getByText: (text: string) => any,
    ) {
        await fireEvent.press(getByText("New request"));

        await waitFor(() => {
            expect(
                getByText("What type of issue?"),
            ).toBeTruthy();
        });
    }

    async function selectCategory(
        getByText: (text: string) => any,
        category: string,
    ) {
        await fireEvent.press(getByText(category));

        await waitFor(() => {
            expect(
                getByText("Describe the issue"),
            ).toBeTruthy();
        });
    }

    it("renders the maintenance screen with initial requests", async () => {
        const { getByText } = await renderMaintenance();

        expect(getByText("New request")).toBeTruthy();
        expect(getByText("MR-1042")).toBeTruthy();
        expect(
            getByText("Kitchen faucet dripping"),
        ).toBeTruthy();
        expect(getByText("MR-1038")).toBeTruthy();
        expect(
            getByText("AC not cooling below 76°F"),
        ).toBeTruthy();
    });

    it("persists the initial maintenance requests to AsyncStorage", async () => {
        await renderMaintenance();

        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        expect(stored).not.toBeNull();

        const requests = JSON.parse(stored as string);

        expect(requests).toHaveLength(2);
        expect(requests[0].id).toBe("MR-1042");
        expect(requests[1].id).toBe("MR-1038");
    });

    it("loads previously stored requests instead of resetting to demo data", async () => {
        const storedRequest = {
            id: "MR-1099",
            category: "Electrical",
            title: "Bedroom outlet not working",
            submitted: "Sep 18",
            status: "submitted",
            statusLabel: "Submitted",
            appt: null,
            note: "The maintenance team will review your request.",
            description:
                "The outlet stopped working this morning.",
            urgency: "normal",
            entryPermission: "enter_if_out",
        };

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([storedRequest]),
        );

        const { getByText, queryByText } =
            await renderMaintenance();

        expect(
            getByText("Bedroom outlet not working"),
        ).toBeTruthy();

        expect(
            queryByText("Kitchen faucet dripping"),
        ).toBeNull();

        expect(getByText("MR-1099")).toBeTruthy();
    });

    it("opens the new maintenance request flow", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);

        expect(getByText("New Request")).toBeTruthy();
        expect(
            getByText("What type of issue?"),
        ).toBeTruthy();

        expect(getByText("Plumbing")).toBeTruthy();
        expect(getByText("Electrical")).toBeTruthy();
        expect(getByText("HVAC")).toBeTruthy();
        expect(getByText("Appliance")).toBeTruthy();
        expect(getByText("Pest")).toBeTruthy();
        expect(getByText("Common Area")).toBeTruthy();
        expect(getByText("Security")).toBeTruthy();
        expect(getByText("Other")).toBeTruthy();
    });

    it("selects a category and advances to the details screen", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        expect(
            getByText("Describe the issue"),
        ).toBeTruthy();
        expect(getByText("Urgency")).toBeTruthy();
        expect(
            getByText("Entry permission"),
        ).toBeTruthy();

        expect(getByText("Normal")).toBeTruthy();
        expect(getByText("Urgent")).toBeTruthy();

        expect(
            getByText("Enter if I'm out"),
        ).toBeTruthy();
        expect(
            getByText("I'll be present"),
        ).toBeTruthy();

        expect(
            getByText("Submit request"),
        ).toBeTruthy();
    });

    it("allows the user to enter a maintenance description", async () => {
        const {
            getByText,
            getByPlaceholderText,
        } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        const input = getByPlaceholderText(
            "Location, symptoms, when it started…",
        );

        await fireEvent.changeText(
            input,
            "Kitchen faucet has been dripping continuously.",
        );

        await waitFor(() => {
            expect(input.props.value).toBe(
                "Kitchen faucet has been dripping continuously.",
            );
        });

        expect(getByText("46/500")).toBeTruthy();
    });

    it("allows the user to select urgent priority", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        await fireEvent.press(getByText("Urgent"));

        await waitFor(() => {
            expect(
                getByText(
                    "Urgent requests are reviewed promptly, but this form is not for emergencies.",
                ),
            ).toBeTruthy();
        });
    });

    it("allows the user to select that they will be present", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        await fireEvent.press(
            getByText("I'll be present"),
        );

        await waitFor(() => {
            expect(
                getByText("I'll be present"),
            ).toBeTruthy();
        });
    });

    it("disables submission when no description is entered", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        const submitText = getByText("Submit request");

        expect(
            submitText.parent?.props.accessibilityState?.disabled,
        ).toBe(true);
    });

    it("does not submit when no description is entered", async () => {
        const { getByText, queryByText } =
            await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        await fireEvent.press(
            getByText("Submit request"),
        );

        await waitFor(() => {
            expect(
                getByText("Describe the issue"),
            ).toBeTruthy();
        });

        expect(
            queryByText("Request submitted"),
        ).toBeNull();

        expect(
            queryByText("MR-1043"),
        ).toBeNull();
    });

    it("submits a maintenance request and persists it", async () => {
        const {
            getByText,
            getByPlaceholderText,
        } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        await fireEvent.changeText(
            getByPlaceholderText(
                "Location, symptoms, when it started…",
            ),
            "Kitchen faucet is leaking under the sink.",
        );

        await waitFor(() => {
            expect(
                getByPlaceholderText(
                    "Location, symptoms, when it started…",
                ).props.value,
            ).toBe(
                "Kitchen faucet is leaking under the sink.",
            );
        });

        await fireEvent.press(
            getByText("Submit request"),
        );

        await waitFor(() => {
            expect(
                getByText("Request submitted"),
            ).toBeTruthy();
        });

        expect(getByText("MR-1043")).toBeTruthy();

        const stored = await AsyncStorage.getItem(
            STORAGE_KEY,
        );

        expect(stored).not.toBeNull();

        const requests = JSON.parse(stored as string);

        expect(requests).toHaveLength(3);

        expect(requests[0]).toEqual(
            expect.objectContaining({
                id: "MR-1043",
                category: "Plumbing",
                status: "submitted",
                statusLabel: "Submitted",
                description:
                    "Kitchen faucet is leaking under the sink.",
                urgency: "normal",
                entryPermission: "enter_if_out",
            }),
        );
    });

    it("persists an urgent request with present entry permission", async () => {
        const {
            getByText,
            getByPlaceholderText,
        } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Electrical");

        await fireEvent.changeText(
            getByPlaceholderText(
                "Location, symptoms, when it started…",
            ),
            "Bedroom outlet is sparking when used.",
        );

        await fireEvent.press(getByText("Urgent"));
        await fireEvent.press(
            getByText("I'll be present"),
        );

        await fireEvent.press(
            getByText("Submit request"),
        );

        await waitFor(() => {
            expect(
                getByText("Request submitted"),
            ).toBeTruthy();
        });

        const stored = await AsyncStorage.getItem(
            STORAGE_KEY,
        );

        expect(stored).not.toBeNull();

        const requests = JSON.parse(stored as string);

        expect(requests[0]).toEqual(
            expect.objectContaining({
                id: "MR-1043",
                category: "Electrical",
                description:
                    "Bedroom outlet is sparking when used.",
                urgency: "urgent",
                entryPermission: "present",
            }),
        );
    });

    it("shows the new request in the list after completing submission", async () => {
        const {
            getByText,
            getAllByText,
            getByPlaceholderText,
        } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "HVAC");

        await fireEvent.changeText(
            getByPlaceholderText(
                "Location, symptoms, when it started…",
            ),
            "AC is making a loud noise.",
        );

        await fireEvent.press(
            getByText("Submit request"),
        );

        await waitFor(() => {
            expect(
                getByText("Request submitted"),
            ).toBeTruthy();
        });

        await fireEvent.press(getByText("Done"));

        await waitFor(() => {
            expect(
                getByText("Maintenance"),
            ).toBeTruthy();

            expect(
                getByText("MR-1043"),
            ).toBeTruthy();
        });

        const matches = getAllByText("AC is making a loud noise.");

        expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("increments the request ID based on the highest existing request", async () => {
        const existingRequests = [
            {
                id: "MR-1042",
                category: "Plumbing",
                title: "Kitchen faucet dripping",
                submitted: "Jul 28",
                status: "scheduled",
                statusLabel: "Scheduled",
                appt: "Tue Aug 6, 10–12 pm",
                note: "Tech will call 30 min before arrival.",
            },
            {
                id: "MR-1050",
                category: "HVAC",
                title: "AC issue",
                submitted: "Sep 10",
                status: "submitted",
                statusLabel: "Submitted",
                appt: null,
                note: "Under review.",
            },
        ];

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(existingRequests),
        );

        const {
            getByText,
            getByPlaceholderText,
        } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Electrical");

        await fireEvent.changeText(
            getByPlaceholderText(
                "Location, symptoms, when it started…",
            ),
            "Hallway light is not working.",
        );

        await fireEvent.press(
            getByText("Submit request"),
        );

        await waitFor(() => {
            expect(
                getByText("MR-1051"),
            ).toBeTruthy();
        });

        const stored = await AsyncStorage.getItem(
            STORAGE_KEY,
        );

        expect(stored).not.toBeNull();

        const requests = JSON.parse(stored as string);

        expect(requests[0].id).toBe("MR-1051");
    });

    it("updates the open and completed counts from persisted requests", async () => {
        const requests = [
            {
                id: "MR-1050",
                category: "Plumbing",
                title: "Leaking faucet",
                submitted: "Sep 10",
                status: "submitted",
                statusLabel: "Submitted",
                appt: null,
                note: "Under review.",
            },
            {
                id: "MR-1049",
                category: "HVAC",
                title: "AC repaired",
                submitted: "Sep 8",
                status: "completed",
                statusLabel: "Completed",
                appt: null,
                note: "Issue resolved.",
            },
            {
                id: "MR-1048",
                category: "Electrical",
                title: "Outlet issue",
                submitted: "Sep 5",
                status: "scheduled",
                statusLabel: "Scheduled",
                appt: "Fri Sep 19, 10–12 pm",
                note: "Tech will call before arrival.",
            },
        ];

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(requests),
        );

        const { getByText } = await renderMaintenance();

        expect(
            getByText("2 open · 1 completed"),
        ).toBeTruthy();
    });

    it("can return from the category screen to the maintenance list", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);

        await fireEvent.press(getByText("Back"));

        await waitFor(() => {
            expect(
                getByText("Maintenance"),
            ).toBeTruthy();

            expect(
                getByText("New request"),
            ).toBeTruthy();
        });
    });

    it("can return from the details screen to category selection", async () => {
        const { getByText } = await renderMaintenance();

        await openNewRequest(getByText);
        await selectCategory(getByText, "Plumbing");

        await fireEvent.press(getByText("Back"));

        await waitFor(() => {
            expect(
                getByText("What type of issue?"),
            ).toBeTruthy();

            expect(
                getByText("Electrical"),
            ).toBeTruthy();
        });
    });
});
