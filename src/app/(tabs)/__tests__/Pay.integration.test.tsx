import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";

import PayTab from "@/app/(tabs)/pay";
import { BALANCE, TRANSACTIONS, fmt } from "@/data/apartment";

const STORAGE_KEY = "@mvp-apartment/pay";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("Pay tab integration", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it("renders the payment center", async () => {
    const { getByText, getByRole } = await render(<PayTab />);

    await waitFor(() => {
      expect(getByText("Payment Center")).toBeTruthy();
      expect(getByText("Balance due")).toBeTruthy();
      expect(getByText(fmt(BALANCE.amount))).toBeTruthy();

      expect(
        getByRole("switch", {
          name: "Autopay",
        }).props.value,
      ).toBe(true);
    });
  });

  it("renders the existing transaction history", async () => {
    const { getByText } = await render(<PayTab />);

    await waitFor(() => {
      expect(getByText("Transaction history")).toBeTruthy();

      for (const transaction of TRANSACTIONS) {
        expect(getByText(transaction.desc)).toBeTruthy();
        expect(getByText(transaction.date)).toBeTruthy();
      }
    });
  });

  it("toggles Autopay off and persists the setting", async () => {
    const { getByRole } = await render(<PayTab />);

    const autopaySwitch = getByRole("switch", {
      name: "Autopay",
    });

    expect(autopaySwitch.props.value).toBe(true);

    fireEvent(
      autopaySwitch,
      "valueChange",
      false,
    );

    await waitFor(() => {
      expect(
        getByRole("switch", {
          name: "Autopay",
        }).props.value,
      ).toBe(false);
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);

    expect(parsed.autopay).toBe(false);
    expect(parsed.balance).toBe(BALANCE.amount);
  });

  it("toggles Autopay back on and persists the setting", async () => {
    const { getByRole } = await render(<PayTab />);

    fireEvent(
      getByRole("switch", {
        name: "Autopay",
      }),
      "valueChange",
      false,
    );

    await waitFor(() => {
      expect(
        getByRole("switch", {
          name: "Autopay",
        }).props.value,
      ).toBe(false);
    });

    fireEvent(
      getByRole("switch", {
        name: "Autopay",
      }),
      "valueChange",
      true,
    );

    await waitFor(() => {
      expect(
        getByRole("switch", {
          name: "Autopay",
        }).props.value,
      ).toBe(true);
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);

    expect(parsed.autopay).toBe(true);
  });

  it("loads the saved Autopay state from AsyncStorage", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        balance: BALANCE.amount,
        autopay: false,
        transactions: TRANSACTIONS,
      }),
    );

    const { getByRole } = await render(<PayTab />);

    await waitFor(() => {
      expect(
        getByRole("switch", {
          name: "Autopay",
        }).props.value,
      ).toBe(false);
    });
  });

  it("opens the checkout screen when the Pay button is pressed", async () => {
    const { getByRole, getByText } = await render(<PayTab />);

    fireEvent.press(
      getByRole("button", {
        name: `Pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Confirm payment")).toBeTruthy();
      expect(getByText("Amount")).toBeTruthy();
      expect(getByText("Payment method")).toBeTruthy();
      expect(
        getByText("Chase Sapphire ••••4521"),
      ).toBeTruthy();
      expect(getByText("Processing fee")).toBeTruthy();
      expect(getByText("$0.00")).toBeTruthy();
    });

    expect(
      getByRole("button", {
        name: `Confirm and pay ${fmt(BALANCE.amount)}`,
      }),
    ).toBeTruthy();
  });

  it("returns from checkout to the payment summary", async () => {
    const { getByRole, getByText } = await render(<PayTab />);

    fireEvent.press(
      getByRole("button", {
        name: `Pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Confirm payment")).toBeTruthy();
    });

    fireEvent.press(
      getByRole("button", {
        name: "Go back to payment summary",
      }),
    );

    await waitFor(() => {
      expect(getByText("Payment Center")).toBeTruthy();
      expect(getByText("Balance due")).toBeTruthy();
    });
  });

  it("submits the payment and clears the balance", async () => {
    const { getByRole, getByText } = await render(<PayTab />);

    fireEvent.press(
      getByRole("button", {
        name: `Pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Confirm payment")).toBeTruthy();
    });

    fireEvent.press(
      getByRole("button", {
        name: `Confirm and pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Payment submitted")).toBeTruthy();
      expect(getByText("Processing")).toBeTruthy();
      expect(getByText("Amount paid")).toBeTruthy();
      expect(getByText("Payment method")).toBeTruthy();
    });

    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(getByText("Payment Center")).toBeTruthy();
      expect(getByText("$0.00")).toBeTruthy();
      expect(getByText("PAID")).toBeTruthy();
    });

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);

    expect(parsed.balance).toBe(0);

    expect(parsed.transactions).toHaveLength(
      TRANSACTIONS.length + 1,
    );

    expect(parsed.transactions[0]).toEqual(
      expect.objectContaining({
        desc: "August 2025 rent",
        amount: BALANCE.amount,
        credit: false,
      }),
    );
  });

  it("adds the payment to transaction history", async () => {
    const { getByRole, getByText } = await render(<PayTab />);

    fireEvent.press(
      getByRole("button", {
        name: `Pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Confirm payment")).toBeTruthy();
    });

    fireEvent.press(
      getByRole("button", {
        name: `Confirm and pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Payment submitted")).toBeTruthy();
      expect(getByText("Processing")).toBeTruthy();
    });

    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(getByText("Payment Center")).toBeTruthy();
      expect(getByText("August 2025 rent")).toBeTruthy();
    });
  });

  it("persists the paid state after remounting", async () => {
    const firstRender = await render(<PayTab />);

    fireEvent.press(
      firstRender.getByRole("button", {
        name: `Pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(
        firstRender.getByText("Confirm payment"),
      ).toBeTruthy();
    });

    fireEvent.press(
      firstRender.getByRole("button", {
        name: `Confirm and pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(
        firstRender.getByText("Payment submitted"),
      ).toBeTruthy();
      expect(
        firstRender.getByText("Processing"),
      ).toBeTruthy();
    });

    fireEvent.press(firstRender.getByText("Done"));

    await waitFor(() => {
      expect(firstRender.getByText("$0.00")).toBeTruthy();
      expect(firstRender.getByText("PAID")).toBeTruthy();
    });

    await firstRender.unmount();

    const secondRender = await render(<PayTab />);

    await waitFor(() => {
      expect(secondRender.getByText("$0.00")).toBeTruthy();
      expect(secondRender.getByText("PAID")).toBeTruthy();
    });
  });

  it("resets the payment demo and persists the original state", async () => {
    const { getByRole, getByText } = await render(<PayTab />);

    // First complete a payment so the demo is in a changed state.
    fireEvent.press(
      getByRole("button", {
        name: `Pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Confirm payment")).toBeTruthy();
    });

    fireEvent.press(
      getByRole("button", {
        name: `Confirm and pay ${fmt(BALANCE.amount)}`,
      }),
    );

    await waitFor(() => {
      expect(getByText("Payment submitted")).toBeTruthy();
    });

    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(getByText("PAID")).toBeTruthy();
      expect(getByText("$0.00")).toBeTruthy();
      expect(
        getByText("August 2025 rent"),
      ).toBeTruthy();
    });

    // Reset the demo.
    fireEvent.press(
      getByRole("button", {
        name: "Reset payment demo",
      }),
    );

    // Verify the UI returns to the original demo state.
    await waitFor(() => {
      expect(getByText("Payment Center")).toBeTruthy();
      expect(getByText("Balance due")).toBeTruthy();
      expect(getByText(fmt(BALANCE.amount))).toBeTruthy();

      expect(
        getByRole("switch", {
          name: "Autopay",
        }).props.value,
      ).toBe(true);
    });

    // Verify the original transaction count is restored.
    expect(
      getByText(
        `${TRANSACTIONS.length} ${
          TRANSACTIONS.length === 1
            ? "transaction"
            : "transactions"
        }`,
      ),
    ).toBeTruthy();

    // Verify the reset state was persisted.
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);

    expect(parsed.balance).toBe(BALANCE.amount);
    expect(parsed.autopay).toBe(true);
    expect(parsed.transactions).toHaveLength(
      TRANSACTIONS.length,
    );
    expect(parsed.transactions).toEqual(TRANSACTIONS);
  });
});
