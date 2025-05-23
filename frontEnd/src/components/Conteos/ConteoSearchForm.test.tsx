import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConteoSearchForm, { ConteoFormValues } from './ConteoSearchForm'; // Assuming ConteoFormValues is exported
import { FormProvider, useForm } from 'react-hook-form';

// Mock react-hook-form
const mockUseForm = jest.fn();
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: (options?: any) => mockUseForm(options),
  // Mock FormProvider if ConteoSearchForm or its children use useFormContext
}));

// Helper to render with FormProvider if the component uses useFormContext
const renderWithFormProvider = (ui: React.ReactElement, formMethods: any) => {
  return render(<FormProvider {...formMethods}>{ui}</FormProvider>);
};


describe('ConteoSearchForm', () => {
  const mockOnSearch = jest.fn();
  let formMethods: any; // To store form methods for each test

  beforeEach(() => {
    mockOnSearch.mockClear();
    // Default mock implementation for useForm for ConteoSearchForm
    formMethods = {
      register: jest.fn((name, rules) => ({ name, rules })),
      handleSubmit: jest.fn((onValid) => async (event?: React.BaseSyntheticEvent) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        // Simulate data retrieval. This is a simplified mock.
        const mockFormData: ConteoFormValues = { conteo: (document.getElementById('conteo-input-for-test') as HTMLInputElement)?.value || '' };
        
        let fieldRules = (formMethods.register as jest.Mock).mock.calls.find(call => call[0] === 'conteo')?.[1];
        let isValid = true;
        if (fieldRules?.required && !mockFormData.conteo) {
            isValid = false;
            formMethods.formState.errors.conteo = { type: 'required', message: typeof fieldRules.required === 'string' ? fieldRules.required : 'Este campo es requerido' };
        }


        if (isValid) {
            await act(async () => {
                onValid(mockFormData);
            });
        } else {
            // If form is invalid, handleSubmit might not call onValid.
            // We might need to trigger error display manually or check component's error rendering.
        }
      }),
      formState: { errors: {} as any, isSubmitting: false },
      watch: jest.fn(),
      setValue: jest.fn(),
      reset: jest.fn(),
      getValues: jest.fn((name?: string) => {
        if (name === 'conteo') {
          const inputElement = screen.queryByPlaceholderText(/Ingrese número de documento de inventario/i) as HTMLInputElement;
          return inputElement ? inputElement.value : '';
        }
        return {};
      })
    };
    mockUseForm.mockReturnValue(formMethods);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Test Case 1: Renders correctly', () => {
    renderWithFormProvider(
      <ConteoSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
      />,
      formMethods
    );

    expect(screen.getByPlaceholderText(/Ingrese número de documento de inventario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buscar/i })).toBeInTheDocument();
  });

  test('Test Case 2: Input field updates', () => {
     renderWithFormProvider(
      <ConteoSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
      />,
      formMethods
    );
    const inputElement = screen.getByPlaceholderText(/Ingrese número de documento de inventario/i) as HTMLInputElement;
    
    fireEvent.change(inputElement, { target: { value: 'DOC987' } });
    expect(inputElement.value).toBe('DOC987');
  });

  test('Test Case 3: Form submission calls onSearch with correct data', async () => {
    const typedValue = 'DOC123';
    // More specific mock for this test to ensure data flows correctly
    mockUseForm.mockReturnValue({
      ...formMethods,
      handleSubmit: jest.fn((onValid) => async (event?: React.BaseSyntheticEvent) => {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        // Simulate RHF passing the actual form data
        await act(async () => { onValid({ conteo: typedValue }); });
      }),
      getValues: jest.fn(() => ({ conteo: typedValue })),
    });

    renderWithFormProvider(
      <ConteoSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
      />,
      mockUseForm() // Use the specific mock for this test
    );

    const inputElement = screen.getByPlaceholderText(/Ingrese número de documento de inventario/i) as HTMLInputElement;
    inputElement.id = 'conteo-input-for-test'; // For the less specific mock if it was used
    const formElement = inputElement.closest('form') as HTMLFormElement;
    
    fireEvent.change(inputElement, { target: { value: typedValue } });
    await act(async () => {
        fireEvent.submit(formElement);
    });
    
    expect(mockOnSearch).toHaveBeenCalledWith({ conteo: typedValue });
  });

  test('Test Case 4: Search button disabled state when isSearching is true', () => {
    mockUseForm.mockReturnValue({...formMethods, formState: { errors: {}, isSubmitting: true }});
    renderWithFormProvider(
      <ConteoSearchForm
        onSearch={mockOnSearch}
        isSearching={true}
      />,
      mockUseForm()
    );
    const button = screen.getByRole('button', { name: /Buscando.../i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-75');
  });

  test('Test Case 5: Validation error for empty input', async () => {
    const errorMessage = "El número de documento de inventario es obligatorio";
    // Simulate errors object from react-hook-form
    mockUseForm.mockReturnValue({
      ...formMethods,
      handleSubmit: jest.fn((onValid, onError) => async (e?: React.BaseSyntheticEvent) => {
        if (e) e.preventDefault();
        // Simulate RHF behavior: if "conteo" is empty, it would populate errors
        // and not call onValid.
        formMethods.formState.errors.conteo = { type: 'required', message: errorMessage };
        // Manually trigger re-render with errors for the test
        if (onError) {
          await act(async () => { onError(formMethods.formState.errors); });
        }
      }),
      formState: { errors: { conteo: { type: 'required', message: errorMessage } }, isSubmitting: false },
      getValues: jest.fn(() => ({ conteo: '' })), // Simulate empty input
    });
    
    renderWithFormProvider(
      <ConteoSearchForm
        onSearch={mockOnSearch}
        isSearching={false}
      />,
      mockUseForm()
    );

    const formElement = screen.getByPlaceholderText(/Ingrese número de documento de inventario/i).closest('form') as HTMLFormElement;
    
    // Simulate form submission with empty input
    await act(async () => {
      fireEvent.submit(formElement);
    });
    
    // Check if the error message is displayed
    // This relies on the <ErrorMessage> component being rendered by ConteoSearchForm
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
