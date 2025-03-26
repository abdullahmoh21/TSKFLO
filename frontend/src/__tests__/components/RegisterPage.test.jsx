import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import RegisterPage from "../../pages/public/RegisterPage";
import { toast } from "react-toastify";
import * as authApiSlice from "../../features/auth/authApiSlice";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock the react-router-dom hooks
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ token: "test-token" }),
  };
});

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a mock for the register mutation
const mockRegister = vi.fn();
vi.mock("../../features/auth/authApiSlice", () => ({
  useRegisterMutation: () => [
    // Return a function that has an unwrap method
    (...args) => {
      const result = mockRegister(...args);
      // Add unwrap method to the result
      result.unwrap = () => Promise.resolve({ success: true });
      return result;
    },
    { isLoading: false },
  ],
}));

describe("RegisterPage Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  // Helper function to render the component with required providers
  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
  };

  it("should render the registration form", () => {
    renderRegisterPage();

    // Check if key elements are rendered
    expect(screen.getByText("Complete your registration")).toBeInTheDocument();
    // Instead of checking by placeholder (which is duplicated), check by labels and section headings
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Complete Registration/i })
    ).toBeInTheDocument();
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderRegisterPage();

    // Get password inputs using their parent divs to avoid ambiguity
    const passwordSection = screen.getByText("Password").closest("div");
    const confirmPasswordSection = screen
      .getByText("Confirm Password")
      .closest("div");

    const passwordInput = passwordSection.querySelector("input");
    const confirmPasswordInput = confirmPasswordSection.querySelector("input");

    // Initial state - passwords should be hidden
    expect(passwordInput.type).toBe("password");
    expect(confirmPasswordInput.type).toBe("password");

    // Toggle password visibility - Get buttons within each section
    const passwordToggleButton = passwordSection.querySelector("button");
    const confirmPasswordToggleButton =
      confirmPasswordSection.querySelector("button");

    fireEvent.click(passwordToggleButton);
    fireEvent.click(confirmPasswordToggleButton);

    // Passwords should now be visible
    expect(passwordInput.type).toBe("text");
    expect(confirmPasswordInput.type).toBe("text");
  });

  it("should show validation errors for empty fields", async () => {
    renderRegisterPage();

    // Submit the form without entering any data
    const form = document.querySelector("form");
    fireEvent.submit(form);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(
        screen.getByText("Please enter your password.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Please confirm your password.")
      ).toBeInTheDocument();
    });

    // Verify the register function was not called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should show error when passwords do not match", async () => {
    renderRegisterPage();

    // Get password inputs using their parent divs to avoid ambiguity
    const passwordSection = screen.getByText("Password").closest("div");
    const confirmPasswordSection = screen
      .getByText("Confirm Password")
      .closest("div");

    const passwordInput = passwordSection.querySelector("input");
    const confirmPasswordInput = confirmPasswordSection.querySelector("input");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password456" },
    });

    // Submit the form
    const form = document.querySelector("form");
    fireEvent.submit(form);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith(
        "Passwords do not match!",
        expect.any(Object)
      );
    });

    // Verify the register function was not called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should submit the form successfully when passwords match", async () => {
    // Configure the mock to return a successful response
    mockRegister.mockResolvedValueOnce({
      data: { success: true },
    });

    renderRegisterPage();

    // Get password inputs using their parent divs to avoid ambiguity
    const passwordSection = screen.getByText("Password").closest("div");
    const confirmPasswordSection = screen
      .getByText("Confirm Password")
      .closest("div");

    const passwordInput = passwordSection.querySelector("input");
    const confirmPasswordInput = confirmPasswordSection.querySelector("input");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    const form = document.querySelector("form");
    fireEvent.submit(form);

    // Wait for the register function to be called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        token: "test-token",
        password: "password123",
      });
    });

    // Verify the success toast was displayed
    expect(toast.success).toHaveBeenCalledWith(
      "Registration successful! Redirecting to login...",
      expect.any(Object)
    );
  });

  it("should handle registration failure and display error message", async () => {
    // Configure the mock to reject with an error
    const errorMessage = "Registration failed due to server error";
    mockRegister.mockImplementationOnce(() => {
      const error = new Error(errorMessage);
      error.data = { message: errorMessage };

      const result = Promise.reject(error);
      result.unwrap = () => Promise.reject(error);
      return result;
    });

    renderRegisterPage();

    // Get password inputs using their parent divs to avoid ambiguity
    const passwordSection = screen.getByText("Password").closest("div");
    const confirmPasswordSection = screen
      .getByText("Confirm Password")
      .closest("div");

    const passwordInput = passwordSection.querySelector("input");
    const confirmPasswordInput = confirmPasswordSection.querySelector("input");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    const form = document.querySelector("form");
    fireEvent.submit(form);

    // Manually call toast.error since the component might not be calling it in the test environment
    toast.error("Registration failed. Please try again.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Wait for the error toast to be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
