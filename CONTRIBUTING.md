# Contributing to Unified Tracking

We love your input! We want to make contributing to Unified Tracking as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js >= 24.2.0
- Yarn package manager
- iOS development: Xcode 14+ and CocoaPods
- Android development: Android Studio and Java 17+

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/aoneahsan/unified-tracking.git
   cd unified-tracking
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Build the project**

   ```bash
   yarn build
   ```

4. **Run tests**
   ```bash
   yarn test
   ```

### Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write your code following our coding standards
   - Add or update tests as needed
   - Update documentation if necessary

3. **Test your changes**

   ```bash
   # Run all tests
   yarn test

   # Run tests in watch mode during development
   yarn test:watch

   # Run linting
   yarn lint

   # Fix linting issues
   yarn fmt
   ```

4. **Build and verify**

   ```bash
   # Build the project
   yarn build

   # Verify all platforms
   yarn verify
   ```

## Code Style and Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- All code must be typed (no `any` types unless absolutely necessary)
- Follow functional programming patterns where possible
- Use meaningful variable and function names

### Code Formatting

We use Prettier and ESLint for consistent code formatting:

```bash
# Check formatting
yarn prettier --check

# Fix formatting
yarn fmt
```

### Naming Conventions

- **Files**: Use kebab-case (e.g., `google-analytics.provider.ts`)
- **Classes**: Use PascalCase (e.g., `GoogleAnalyticsProvider`)
- **Functions/Variables**: Use camelCase (e.g., `trackEvent`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`)
- **Interfaces**: Use PascalCase with descriptive names (e.g., `AnalyticsConfig`)

### Project Structure

```
src/
├── providers/           # Provider implementations
│   ├── analytics/      # Analytics providers
│   └── error-handling/ # Error tracking providers
├── react/              # React-specific code
├── capacitor/          # Capacitor-specific code
├── utils/              # Shared utilities
└── types/              # Type definitions
```

### Testing Standards

- Write unit tests for all new functionality
- Use Vitest for testing (not Jest)
- Test coverage should be maintained at 80%+
- Integration tests for provider interactions
- Mock external dependencies appropriately

#### Test File Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YourClass } from './your-file';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
  });

  it('should do something', () => {
    // Test implementation
    expect(instance.method()).toBe(expectedResult);
  });
});
```

### Provider Implementation Guidelines

When adding a new provider:

1. **Create the provider directory**

   ```
   src/providers/analytics/your-provider/
   ├── index.ts
   ├── your-provider.provider.ts
   └── your-provider.provider.test.ts
   ```

2. **Extend the base provider**

   ```typescript
   import { BaseAnalyticsProvider } from '@/providers/base-analytics-provider';
   import { RegisterProvider } from '@/decorators/register-provider';

   @RegisterProvider({
     id: 'your-provider',
     name: 'Your Provider',
     type: 'analytics',
   })
   export class YourProviderAnalytics extends BaseAnalyticsProvider {
     // Implementation
   }
   ```

3. **Add configuration interface**

   ```typescript
   export interface YourProviderConfig {
     apiKey: string;
     // other config options
   }
   ```

4. **Write comprehensive tests**
   - Test initialization
   - Test all public methods
   - Test error handling
   - Test configuration validation

## Platform-Specific Development

### Web Development

- Test in modern browsers (Chrome, Firefox, Safari, Edge)
- Ensure graceful degradation when third-party scripts aren't loaded
- Test with Content Security Policy restrictions

### iOS Development (Swift)

- Follow Swift coding conventions
- Use proper error handling with do-catch blocks
- Ensure thread safety for UI operations
- Test on both device and simulator

### Android Development (Java/Kotlin)

- Follow Android coding conventions
- Handle permissions properly
- Ensure proper lifecycle management
- Test on multiple API levels

## Documentation

### Code Documentation

- Use TSDoc/JSDoc comments for public APIs
- Include usage examples in documentation
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

### API Documentation

- Update `docs/api/` when adding new features
- Include code examples for new functionality
- Document breaking changes clearly
- Update migration guides when necessary

## Commit Message Guidelines

We follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes to build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Examples

```
feat(analytics): add PostHog provider support

fix(react): resolve memory leak in useTracking hook

docs: update installation instructions for Capacitor v7

test(providers): add integration tests for Sentry provider
```

## Release Process

1. Releases are handled by maintainers
2. Version bumps follow semantic versioning
3. Changelog is automatically generated from commit messages
4. All platforms are tested before release

## Getting Help

- 📖 Check the [documentation](./docs/README.md)
- 🐛 Search [existing issues](https://github.com/aoneahsan/unified-tracking/issues)
- 💬 Start a [discussion](https://github.com/aoneahsan/unified-tracking/discussions)
- 📧 Email the maintainer: [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at aoneahsan@gmail.com.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:

- CHANGELOG.md for their contributions
- README.md contributors section
- Release notes when applicable

Thank you for contributing to Unified Tracking! 🚀
