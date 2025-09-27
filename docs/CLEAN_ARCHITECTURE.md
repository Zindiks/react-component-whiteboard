# Clean Architecture Implementation

This document outlines the clean architecture implementation for the React Component Whiteboard project, including the use of Zod for validation and best practices.

## Architecture Overview

The project now follows clean architecture principles with clear separation of concerns across different layers:

```
src/
├── domain/                 # Business logic and rules (innermost layer)
│   ├── entities/          # Domain entities with business logic
│   ├── schemas/           # Zod validation schemas and types
│   ├── use-cases/         # Application business rules
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── application/           # Application-specific business rules
│   ├── services/          # Application services
│   └── use-cases/         # Application use cases
├── infrastructure/        # External interfaces and frameworks
│   ├── repositories/      # Repository implementations
│   ├── adapters/          # Adapters for external systems
│   └── stores/            # State management implementations
└── presentation/          # UI layer
    ├── components/        # React components
    └── hooks/             # Presentation layer hooks
```

## Core Principles

### 1. Dependency Inversion
- Inner layers define interfaces
- Outer layers implement these interfaces
- Dependencies point inward

### 2. Validation with Zod
- All data is validated using Zod schemas
- Type safety is enforced at runtime
- Business rules are encoded in schemas

### 3. Immutable Entities
- Entities are immutable
- Updates return new instances
- State changes are explicit

### 4. Use Cases for Business Logic
- Business operations are encapsulated in use cases
- Clear separation between business logic and infrastructure
- Testable business rules

## Key Components

### Domain Layer

#### Entities (`src/domain/entities/`)
```typescript
// Component.entity.ts - Domain entity with business logic
export class ComponentEntity {
  constructor(private _data: ComponentType) {
    // Validation happens in constructor
  }
  
  update(data: ComponentUpdate): ComponentEntity {
    // Returns new instance
  }
  
  overlaps(other: ComponentEntity): boolean {
    // Business logic method
  }
}
```

#### Schemas (`src/domain/schemas/`)
```typescript
// component.schema.ts - Zod validation schemas
export const ComponentSchema = z.object({
  id: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  type: ComponentTypeSchema,
  // ... other fields with validation rules
});

export type Component = z.infer<typeof ComponentSchema>;
```

#### Use Cases (`src/domain/use-cases/`)
```typescript
// ComponentUseCases.ts - Business operations
export class ComponentUseCases {
  constructor(private componentRepository: IComponentRepository) {}
  
  async createComponent(data: ComponentCreate): Promise<OperationResult> {
    // Business logic for component creation
  }
}
```

#### Repositories (`src/domain/repositories/`)
```typescript
// IComponentRepository.ts - Repository interface
export interface IComponentRepository {
  getAll(): Promise<ComponentEntity[]>;
  create(data: ComponentCreate): Promise<OperationResult>;
  // ... other repository methods
}
```

### Infrastructure Layer

#### Repository Implementation (`src/infrastructure/repositories/`)
```typescript
// ZustandComponentRepository.ts - Zustand-based implementation
export class ZustandComponentRepository implements IComponentRepository {
  // Implements the repository interface using Zustand
}
```

#### Clean Store (`src/infrastructure/stores/`)
```typescript
// CleanWhiteboardStore.ts - Clean architecture store
export const useCleanWhiteboardStore = create<CleanWhiteboardStore>((set, get) => {
  // Uses use cases and repositories
});
```

#### Legacy Adapter (`src/infrastructure/adapters/`)
```typescript
// LegacyStoreAdapter.ts - Bridges old and new architecture
export const useWhiteboardStoreWithCleanArchitecture = () => {
  // Provides backward compatibility
};
```

## Validation Strategy

### 1. Schema-First Design
All data structures are defined using Zod schemas:

```typescript
export const ComponentSchema = z.object({
  id: z.number().int().positive(),
  type: ComponentTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().positive().optional(),
  // Validation rules encoded in schema
});
```

### 2. Runtime Type Safety
- Data is validated at boundaries
- Invalid data is rejected early
- Type safety is maintained throughout

### 3. Validation Utilities
```typescript
// ValidationUtils provides consistent validation handling
const result = ValidationUtils.validate(ComponentSchema, data);
if (!result.success) {
  throw new Error(result.error);
}
```

### 4. Error Handling
- Structured error responses
- Detailed validation messages
- Graceful failure handling

## Migration Strategy

### Phase 1: Foundation (✅ Complete)
- [x] Install and configure Zod
- [x] Create domain schemas and validation models
- [x] Implement validation utilities
- [x] Create domain entities with validation

### Phase 2: Core Architecture (✅ Complete)
- [x] Implement use cases for component management
- [x] Create repository interfaces and implementations
- [x] Build clean architecture store
- [x] Create legacy adapter for backward compatibility

### Phase 3: Component Migration (Next)
- [ ] Update hooks to use clean architecture
- [ ] Migrate components to use validated props
- [ ] Update component creators to use use cases
- [ ] Implement proper error handling in UI

### Phase 4: Advanced Features (Future)
- [ ] Add domain services for complex business logic
- [ ] Implement application services
- [ ] Add more sophisticated validation rules
- [ ] Create audit trail and logging

## Usage Examples

### Creating a Component with Validation
```typescript
import { useCleanWhiteboardStore } from '../infrastructure/stores/CleanWhiteboardStore';

const MyComponent = () => {
  const store = useCleanWhiteboardStore();
  
  const handleCreateComponent = async () => {
    const result = await store.createComponent({
      type: 'rectangle',
      x: 100,
      y: 200,
      width: 150,
      height: 100,
    });
    
    if (!result.success) {
      console.error('Validation failed:', result.error);
      return;
    }
    
    console.log('Component created successfully');
  };
};
```

### Using Legacy Compatibility
```typescript
import { useWhiteboardStoreWithCleanArchitecture } from '../infrastructure/adapters/LegacyStoreAdapter';

const LegacyComponent = () => {
  // Drop-in replacement for useWhiteboardStore
  const store = useWhiteboardStoreWithCleanArchitecture();
  
  // Same API as before, but with validation under the hood
  const components = store.components;
  const addComponent = store.addNewComponent;
};
```

### Direct Entity Usage
```typescript
import { ComponentEntity } from '../domain/entities/Component.entity';

const handleComponentLogic = (data) => {
  try {
    const component = ComponentEntity.fromUnsafeData(data);
    
    // Use business methods
    const moved = component.updatePosition(200, 300);
    const validation = component.validate();
    
    if (!validation.isValid) {
      console.error('Component validation failed:', validation.errors);
    }
  } catch (error) {
    console.error('Invalid component data:', error.message);
  }
};
```

## Testing Strategy

### 1. Domain Layer Tests
- Entity business logic tests
- Validation schema tests
- Use case tests

### 2. Infrastructure Tests
- Repository implementation tests
- Store integration tests
- Adapter compatibility tests

### 3. Integration Tests
- End-to-end workflow tests
- Cross-layer interaction tests
- Validation integration tests

## Benefits

### 1. Type Safety with Runtime Validation
- Compile-time AND runtime type checking
- Early error detection
- Consistent data validation

### 2. Maintainable Architecture
- Clear separation of concerns
- Testable business logic
- Modular design

### 3. Backward Compatibility
- Gradual migration path
- No breaking changes to existing code
- Legacy adapter provides smooth transition

### 4. Enhanced Developer Experience
- Better error messages
- IntelliSense support
- Self-documenting schemas

### 5. Business Logic Protection
- Domain rules are enforced
- Invalid states are prevented
- Data integrity is maintained

## Best Practices

### 1. Schema Design
- Keep schemas focused and cohesive
- Use composition for complex types
- Document validation rules

### 2. Entity Design
- Keep entities immutable
- Include business logic methods
- Validate on construction

### 3. Use Case Design
- One use case per business operation
- Include proper error handling
- Return structured results

### 4. Error Handling
- Use structured error types
- Provide meaningful error messages
- Handle validation errors gracefully

### 5. Testing
- Test business logic in isolation
- Mock external dependencies
- Use property-based testing for schemas

## Future Enhancements

1. **Domain Events**: Implement domain events for side effects
2. **CQRS**: Separate command and query responsibilities
3. **Middleware**: Add validation and logging middleware
4. **Performance**: Optimize validation for large datasets
5. **Persistence**: Add proper persistence layer
6. **Audit Trail**: Implement change tracking
7. **Versioning**: Add schema versioning support

This clean architecture implementation provides a solid foundation for scalable, maintainable, and well-validated code while preserving backward compatibility with the existing system.