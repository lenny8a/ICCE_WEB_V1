import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaterialList from './MaterialList';
import { MaterialReserva } from '../../types/picking';

const mockMaterials: MaterialReserva[] = [
  {
    MATNR: 'MAT001',
    MAKTX: 'Material Description 1',
    MENGE: '10',
    MEINS: 'U',
    CASES: [
      { CASE: 'CASE001', UBICACION: 'LOC001', CANTIDAD: '5', WERKS: 'W001', LGORT: 'L001' },
      { CASE: 'CASE002', UBICACION: 'LOC002', CANTIDAD: '5', WERKS: 'W001', LGORT: 'L001' },
    ],
  },
  {
    MATNR: 'MAT002',
    MAKTX: 'Material Description 2',
    MENGE: '20',
    MEINS: 'U',
    CASES: [{ CASE: 'CASE003', UBICACION: 'LOC003', CANTIDAD: '0', WERKS: 'W001', LGORT: 'L001' }], // No available quantity
  },
  {
    MATNR: 'MAT003',
    MAKTX: 'Material Description 3',
    MENGE: '5',
    MEINS: 'EA',
    CASES: [], // No cases at all
  },
    {
    MATNR: 'MAT004',
    MAKTX: 'Material With Available Case For Callback Test',
    MENGE: '15',
    MEINS: 'U',
    CASES: [{ CASE: 'CASE004', UBICACION: 'LOC004', CANTIDAD: '10', WERKS: 'W001', LGORT: 'L001' }],
  },
];

const mockOnOpenMaterialModal = jest.fn();

describe('MaterialList', () => {
  beforeEach(() => {
    mockOnOpenMaterialModal.mockClear();
  });

  // Test Case 1: Renders correctly with materials (desktop view).
  test('TC1: renders correctly with materials (desktop view)', () => {
    render(
      <MaterialList
        materials={mockMaterials}
        isMobile={false}
        processingComplete={false}
        canModificar={true}
        onOpenMaterialModal={mockOnOpenMaterialModal}
        tipodoc="Reserva"
      />
    );

    // Check table headers
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('Acción')).toBeInTheDocument();

    // Check material 1 details
    expect(screen.getByText('MAT001')).toBeInTheDocument();
    expect(screen.getByText('Material Description 1')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('10') && content.includes('U'))).toBeInTheDocument();
    const buttonsMat1 = screen.getAllByText('Ver ubicaciones');
    // Ensure we find the button associated with MAT001. This might require more specific selectors if text is not unique.
    // For now, we assume the first one found for "Ver ubicaciones" is for MAT001 if MAT001 has available cases.
    expect(buttonsMat1[0]).toBeInTheDocument();


    // Check material 2 (no available cases, so "No cases disponibles" message)
    expect(screen.getByText('MAT002')).toBeInTheDocument();
    expect(screen.getByText('No cases disponibles')).toBeInTheDocument();
  });

  // Test Case 2: Renders correctly with materials (mobile view).
  test('TC2: renders correctly with materials (mobile view)', () => {
    render(
      <MaterialList
        materials={mockMaterials.filter(m => m.MATNR === 'MAT001' || m.MATNR === 'MAT002')} // Only first two for simplicity
        isMobile={true}
        processingComplete={false}
        canModificar={true}
        onOpenMaterialModal={mockOnOpenMaterialModal}
        tipodoc="Reserva"
      />
    );
    // Check material 1 details in card structure
    expect(screen.getByText('MAT001')).toBeInTheDocument();
    expect(screen.getByText('Material Description 1')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('10') && content.includes('U'))).toBeInTheDocument();
    expect(screen.getByText('Ver ubicaciones')).toBeInTheDocument(); // For MAT001

    // Check material 2 (no available cases)
    expect(screen.getByText('MAT002')).toBeInTheDocument();
    expect(screen.getByText('No cases disponibles')).toBeInTheDocument();
  });

  // Test Case 3: Renders empty state or minimal output when no materials are provided.
  test('TC3: renders minimal output when no materials are provided', () => {
    render(
      <MaterialList
        materials={[]}
        isMobile={false}
        processingComplete={false}
        canModificar={true}
        onOpenMaterialModal={mockOnOpenMaterialModal}
        tipodoc="Reserva"
      />
    );
    // Depending on implementation, it might render nothing or a specific message.
    // If it renders nothing significant, we check that material-specific texts are not present.
    expect(screen.queryByText('MAT001')).not.toBeInTheDocument();
    // If there's a specific empty message, assert its presence:
    // expect(screen.getByText('No hay materiales en esta reserva.')).toBeInTheDocument(); 
    // For now, we assume it just doesn't render the list.
  });

  // Test Case 4: "Ver ubicaciones" button disabled states.
  describe('TC4: "Ver ubicaciones" button disabled states', () => {
    test('Scenario A: canModificar={false}', () => {
      render(
        <MaterialList
          materials={[mockMaterials[0]]} // MAT001 has available cases
          isMobile={false}
          processingComplete={false}
          canModificar={false}
          onOpenMaterialModal={mockOnOpenMaterialModal}
        />
      );
      const button = screen.getByText('Ver ubicaciones');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-75 disabled:cursor-not-allowed');
      expect(button).toHaveAttribute('title', 'No tiene permisos para esta acción');
    });

    test('Scenario B: processingComplete={true}', () => {
      render(
        <MaterialList
          materials={[mockMaterials[0]]}
          isMobile={false}
          processingComplete={true}
          canModificar={true}
          onOpenMaterialModal={mockOnOpenMaterialModal}
        />
      );
      const button = screen.getByText('Ver ubicaciones');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-75 disabled:cursor-not-allowed');
      expect(button).toHaveAttribute('title', 'El picking ya ha sido procesado');
    });

    test('Scenario C: Material has no cases with CANTIDAD > 0', () => {
      render(
        <MaterialList
          materials={[mockMaterials[1]]} // MAT002 has cases but CANTIDAD is '0'
          isMobile={false}
          processingComplete={false}
          canModificar={true}
          onOpenMaterialModal={mockOnOpenMaterialModal}
        />
      );
      expect(screen.getByText('No cases disponibles')).toBeInTheDocument();
      expect(screen.queryByText('Ver ubicaciones')).not.toBeInTheDocument();
    });
     test('Scenario D: Material has no cases array', () => {
      render(
        <MaterialList
          materials={[mockMaterials[2]]} // MAT003 has empty CASES array
          isMobile={false}
          processingComplete={false}
          canModificar={true}
          onOpenMaterialModal={mockOnOpenMaterialModal}
        />
      );
      expect(screen.getByText('No cases disponibles')).toBeInTheDocument();
      expect(screen.queryByText('Ver ubicaciones')).not.toBeInTheDocument();
    });
  });

  // Test Case 5: onOpenMaterialModal callback.
  test('TC5: onOpenMaterialModal callback is called with correct material', () => {
    const materialWithCases = mockMaterials.find(m => m.MATNR === 'MAT004'); // Use specific material for this
    if (!materialWithCases) throw new Error("Test material MAT004 not found");

    render(
      <MaterialList
        materials={[materialWithCases]}
        isMobile={false}
        processingComplete={false}
        canModificar={true}
        onOpenMaterialModal={mockOnOpenMaterialModal}
      />
    );
    
    const button = screen.getByText('Ver ubicaciones');
    fireEvent.click(button);
    expect(mockOnOpenMaterialModal).toHaveBeenCalledTimes(1);
    expect(mockOnOpenMaterialModal).toHaveBeenCalledWith(materialWithCases);
  });
});
