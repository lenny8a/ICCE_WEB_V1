import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReservaSearchForm from './ReservaSearchForm';
import { useForm, FormProvider } from 'react-hook-form'; // Import FormProvider

// More flexible mock for react-hook-form
const mockUseForm = jest.fn();
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: (options?: any) => mockUseForm(options), // Allow options to be passed
}));

// Helper to render with FormProvider if needed for context-dependent hooks
const renderWithFormProvider = (ui: React.ReactElement, formMethods: any) => {
  return render(<FormProvider {...formMethods}>{ui}</FormProvider>);
};


describe('ReservaSearchForm', () => {
  const mockOnSearch = jest.fn();
  let formMethods: any; // To store form methods for each test

  beforeEach(() => {
    mockOnSearch.mockClear();
    // Default mock implementation for useForm
    formMethods = {
      register: jest.fn((name, rules) => ({ name, rules })),
      handleSubmit: jest.fn((onValid) => async (event?: React.BaseSyntheticEvent) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        // Simulate data retrieval based on a simple form model
        // This is still a simplification. For real input interaction,
        // you'd typically let RHF manage the state and extract it via watch or getValues.
        // Here, we'll assume the input value is directly passed or can be faked.
        const mockFormData = { reserva: (document.getElementById('reserva-input') as HTMLInputElement)?.value || '' };
        if (mockFormData.reserva || !rules?.required) { // Basic check for required rule
          await act(async () => { // Ensure state updates within handleSubmit are processed
            onValid(mockFormData);
          });
        } else if (rules?.required) {
            // Simulate RHF calling onError or setting errors
            formMethods.formState.errors.reserva = { type: 'required', message: typeof rules.required === 'string' ? rules.required : 'Error' };
        }
      }),
      formState: { errors: {} as any, isSubmitting: false }, // Ensure errors is properly typed if possible
      watch: jest.fn(),
      setValue: jest.fn(),
      reset: jest.fn(),
       getValues: jest.fn((name?: string) => { // Add getValues mock
        if (name === 'reserva') {
          // In a real test, you might need to interact with the DOM to get the value
          // or have a more sophisticated state management for the mock.
          // For now, let's assume it can grab from a hypothetical input if needed.
          const inputElement = screen.queryByPlaceholderText(/Ingrese Nro de Reserva u Hoja de Entrega/i) as HTMLInputElement;
          return inputElement ? inputElement.value : '';
        }
        return {};
      })
    };
    mockUseForm.mockReturnValue(formMethods);
  });
  
  afterEach(() => {
    jest.restoreAllMocks(); // Clean up mocks after each test
  });


  test('Test Case 1: Renders correctly', () => {
    renderWithFormProvider(
      <ReservaSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
        isProcessingComplete={false}
      />,
      formMethods
    );

    expect(screen.getByPlaceholderText(/Ingrese Nro de Reserva u Hoja de Entrega/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buscar/i })).toBeInTheDocument();
  });

  test('Test Case 2: Input field updates', () => {
    renderWithFormProvider(
      <ReservaSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
        isProcessingComplete={false}
      />,
      formMethods
    );
    const inputElement = screen.getByPlaceholderText(/Ingrese Nro de Reserva u Hoja de Entrega/i) as HTMLInputElement;
    
    fireEvent.change(inputElement, { target: { value: '12345' } });
    // In a real scenario with an uncontrolled RHF input, its value might not directly reflect.
    // However, if it's a controlled input (using watch/setValue), this would be accurate.
    // For this test, we'll assume the input itself reflects the change for basic interaction testing.
    expect(inputElement.value).toBe('12345');
  });
  
  test('Test Case 3: Form submission calls onSearch with correct data', async () => {
    const typedValue = 'RES123';
    // More refined mock for this specific test if needed, or rely on the beforeEach setup if sufficient
     mockUseForm.mockReturnValue({
      ...formMethods, // Spread default methods
      handleSubmit: jest.fn((onValid) => async (event?: React.BaseSyntheticEvent) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        // Simulate RHF actually providing the data from the form
        await act(async () => {
            onValid({ reserva: typedValue });
        });
      }),
      getValues: jest.fn(() => ({ reserva: typedValue })), // Ensure getValues returns the typed value
    });


    renderWithFormProvider(
      <ReservaSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
        isProcessingComplete={false}
      />,
       mockUseForm() // Use the specific mock for this test if it was set
    );

    const inputElement = screen.getByPlaceholderText(/Ingrese Nro de Reserva u Hoja de Entrega/i) as HTMLInputElement;
    // Assign an id to make it findable for the handleSubmit mock if it tries to read directly (though not best practice for mock)
    inputElement.id = 'reserva-input'; 
    const formElement = inputElement.closest('form') as HTMLFormElement;
    
    fireEvent.change(inputElement, { target: { value: typedValue } });
    await act(async () => {
        fireEvent.submit(formElement);
    });
    
    expect(mockOnSearch).toHaveBeenCalledWith({ reserva: typedValue });
  });


  test('Test Case 4: Search button disabled states', () => {
    // Test when isSearching is true
    mockUseForm.mockReturnValue({...formMethods, formState: { errors: {}, isSubmitting: true }});
    const { rerender } = renderWithFormProvider(
      <ReservaSearchForm
        onSearch={mockOnSearch}
        isSearching={true}
        isProcessingComplete={false}
      />,
      mockUseForm()
    );
    expect(screen.getByRole('button', { name: /Buscando.../i })).toBeDisabled();

    // Test when isProcessingComplete is true
    mockUseForm.mockReturnValue({...formMethods, formState: { errors: {}, isSubmitting: false }});
    rerender(
      <FormProvider {...mockUseForm()}>
        <ReservaSearchForm
          onSearch={mockOnSearch}
          isSearching={false}
          isProcessingComplete={true}
        />
      </FormProvider>
    );
    const searchButton = screen.getByRole('button', { name: /Buscar/i });
    expect(searchButton).toBeDisabled();
    expect(searchButton).toHaveClass('disabled:opacity-70');
  });
  
  test('Test Case 5: Validation error for empty input', async () => {
    // Mock useForm to simulate an error state for a required field
    const errors = { reserva: { type: 'required', message: 'El número de documento es obligatorio' } };
    mockUseForm.mockReturnValue({
        ...formMethods,
        handleSubmit: jest.fn((onValid, onError) => async (event?: React.BaseSyntheticEvent) => {
            if (event) event.preventDefault();
            // Simulate RHF: if input is empty, it would call onError or set errors
            // For this test, we directly set the errors in formState.
            if (onError) { // If an onError callback is provided by RHF for invalid submission
                await act(async () => {
                    onError(errors);
                });
            }
        }),
        formState: { errors, isSubmitting: false }, // Provide the errors object
        getValues: jest.fn(() => ({ reserva: '' })), // Simulate empty input
    });

    renderWithFormProvider(
      <ReservaSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
        isProcessingComplete={false}
      />,
      mockUseForm()
    );

    const formElement = screen.getByPlaceholderText(/Ingrese Nro de Reserva u Hoja de Entrega/i).closest('form') as HTMLFormElement;
    
    await act(async () => {
        fireEvent.submit(formElement);
    });
    
    // Check if the error message is displayed
    // This requires that your ReservaSearchForm component renders the error message
    // when formState.errors.reserva exists.
    expect(screen.getByText('El número de documento es obligatorio')).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
