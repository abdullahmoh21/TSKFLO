# Frontend Unit Tests

This directory contains unit tests for the frontend application. We use Jest and React Testing Library to test our components, utilities, and services.

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage reports:

```bash
npm run test:coverage
```

Coverage reports will be generated in the `test-results/coverage` directory.

## Test Organization

Tests are organized to mirror the structure of the source code:

- `components/` - Tests for React components
- `services/` - Tests for services like API calls and socket connections
- `utils/` - Tests for utility functions
- `context/` - Tests for React contexts

## What We Test

### Components
- Rendering correctly (UI matches expectations)
- Props are handled correctly
- State changes and lifecycle behaviors
- User interactions (clicks, form submissions, etc.)
- Conditional rendering based on props/state

### Services
- API calls are made with correct parameters
- Socket connections are established and managed correctly
- Error handling works as expected

### Utils
- Pure functions work correctly with different inputs
- Edge cases are handled properly

### Context
- Context providers supply the correct values
- Context consumers receive updates

## Adding New Tests

When adding new components or features, please follow these guidelines:

1. Create a corresponding test file in the appropriate directory
2. Test both success and failure scenarios
3. Mock external dependencies
4. Aim for at least 80% code coverage 