import { describe, it, expect, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { LoginPage } from "../pages/LoginPage";
import { RequireAuth } from "../components/RequireAuth";
import { TabBar } from "../components/TabBar";
import { useAuthStore } from "../lib/auth-store";
import { tokenHolder } from "../lib/token-holder";
import { server } from "../mocks/server";
import { testUser } from "../mocks/handlers";
import { renderWithProviders } from "./test-utils";

const STORED_PROFILE = JSON.stringify({
  id: "1",
  name: "Test User",
  displayName: "Test User",
  email: "test@test.com",
  role: "User",
  roleName: "User",
});

describe("Auth Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    tokenHolder.set(null);
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isBootstrapping: true,
    });
  });

  it("login with valid credentials updates auth store", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@eventnest.io");
    await user.type(screen.getByLabelText(/^password$/i), "Admin@123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().accessToken).not.toBeNull();
      expect(useAuthStore.getState().user?.name).toBe("Test User");
    });
  });

  it("login does not persist any token in localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@eventnest.io");
    await user.type(screen.getByLabelText(/^password$/i), "Admin@123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    expect(await screen.findByText("Welcome back!")).toBeInTheDocument();
    expect(localStorage.getItem("eventnest.access_token")).toBeNull();
    expect(localStorage.getItem("eventnest.refresh_token")).toBeNull();
    expect(JSON.parse(localStorage.getItem("eventnest.user")!)).toMatchObject({
      email: "test@test.com",
    });
  });

  it("login with invalid credentials shows error message", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "bad@email.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    expect(document.querySelector(".alert")).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("logout clears session state, profile, and legacy keys", () => {
    localStorage.setItem("eventnest.user", STORED_PROFILE);
    localStorage.setItem("eventnest.access_token", "legacy-token");
    localStorage.setItem("eventnest.refresh_token", "legacy-refresh");
    useAuthStore.setState({
      accessToken: "fake-token",
      user: testUser,
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("eventnest.user")).toBeNull();
    expect(localStorage.getItem("eventnest.access_token")).toBeNull();
    expect(localStorage.getItem("eventnest.refresh_token")).toBeNull();
  });

  it("bootstrap restores the session from the refresh cookie", async () => {
    localStorage.setItem("eventnest.user", STORED_PROFILE);
    localStorage.setItem("eventnest.access_token", "legacy-token");
    localStorage.setItem("eventnest.refresh_token", "legacy-refresh");

    await useAuthStore.getState().bootstrap();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe("Test User");
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
    expect(localStorage.getItem("eventnest.access_token")).toBeNull();
    expect(localStorage.getItem("eventnest.refresh_token")).toBeNull();
  });

  it("bootstrap without a valid cookie lands anonymous and cleans storage", async () => {
    localStorage.setItem("eventnest.user", STORED_PROFILE);
    localStorage.setItem("eventnest.access_token", "legacy-token");
    localStorage.setItem("eventnest.refresh_token", "legacy-refresh");
    server.use(
      http.post("/api/auth/refresh", () =>
        HttpResponse.json(
          {
            code: 401,
            success: false,
            message: "Invalid refresh token.",
            result: null,
            errors: null,
          },
          { status: 401 },
        ),
      ),
    );

    await useAuthStore.getState().bootstrap();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
    expect(localStorage.getItem("eventnest.user")).toBeNull();
    expect(localStorage.getItem("eventnest.access_token")).toBeNull();
    expect(localStorage.getItem("eventnest.refresh_token")).toBeNull();
  });

  it("navigation shows logged-in items during bootstrap when a profile is stored", () => {
    localStorage.setItem("eventnest.user", STORED_PROFILE);
    useAuthStore.setState({
      user: JSON.parse(STORED_PROFILE),
      isBootstrapping: true,
      isAuthenticated: false,
    });

    renderWithProviders(<TabBar indexOpen={false} onOpenIndex={() => {}} />);

    expect(screen.getByText("My RSVPs")).toBeInTheDocument();
    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  });

  it("protected routes show the boot gate while bootstrapping", async () => {
    renderWithProviders(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /checking your session/i,
    );
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();

    act(() => {
      useAuthStore.setState({
        isBootstrapping: false,
        isAuthenticated: true,
        user: testUser,
      });
    });

    expect(await screen.findByText("Secret content")).toBeInTheDocument();
  });
});
