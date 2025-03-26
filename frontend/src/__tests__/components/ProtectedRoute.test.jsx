import React from "react";
import { render, screen } from "@testing-library/react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProtectedRoute from "../../components/route_protection/UserRoute";
import { vi, describe, it, expect, beforeAll, beforeEach } from "vitest";

// Mock the selectCurrentToken function specifically
vi.mock("../../features/auth/authSlice", () => ({
  selectCurrentToken: vi.fn().mockImplementation((state) => state.auth.token),
  selectCurrentUserRole: vi.fn().mockImplementation((state) => "user"),
}));

// Create a mock for Navigate component before the test suite
const mockNavigate = vi.fn();
beforeAll(() => {
  // Mock react-router-dom components
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      Navigate: (props) => {
        mockNavigate(props.to);
        return null;
      },
    };
  });
});

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock the redux store
  const mockStore = (initialState) => {
    return configureStore({
      reducer: {
        auth: (state = initialState, action) => state,
      },
      preloadedState: {
        auth: initialState,
      },
    });
  };

  // Helper function to render the component with required providers
  const renderWithRouterAndRedux = (
    ui,
    { reduxState = {}, initialEntries = ["/"] } = {}
  ) => {
    const store = mockStore(reduxState);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={ui}>
              <Route
                path="/"
                element={<div data-testid="protected">Protected Content</div>}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  };

  // Skipping this test for now until we can properly test the spinner
  it.skip("should show loading spinner when checking authentication", () => {
    // Initial render will show loading due to useState initialization
    renderWithRouterAndRedux(<ProtectedRoute />);

    // This test needs a better approach to check for the spinner
    // In a real implementation, we would use a data-testid for this
  });

  it("should redirect to login when not authenticated", () => {
    renderWithRouterAndRedux(<ProtectedRoute />, {
      reduxState: { token: null },
    });

    // We can't easily assert navigation in JSDOM, but we could check that the
    // children are not rendered when not authenticated
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should render children when authenticated", () => {
    renderWithRouterAndRedux(<ProtectedRoute />, {
      reduxState: { token: "valid-token" },
    });

    // Debug the DOM to see what's rendered
    console.log(document.body.innerHTML);

    // The UserRoute should render the Outlet content which is our test element
    expect(screen.getByTestId("protected")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
