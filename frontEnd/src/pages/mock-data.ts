export interface ReservaForm {
    reserva: string
  }
  
  export interface CaseReserva {
    CASE: string
    UBICACION: string
    CANTIDAD: string
  }
  
  export interface MaterialReserva {
    MATNR: string
    MAKTX: string
    MENGE: string
    MEINS: string
    CASES: CaseReserva[]
  }
  
  export interface ReservaData {
    RESERVA: string
    MATERIALES: MaterialReserva[]
  }
  
  

// Datos de ejemplo para las reservas con estructura mejorada
export const mockReservaData: ReservaData = {
  RESERVA: "1000045678",
  MATERIALES: [
    {
      MATNR: "MAT001",
      MAKTX: "Tornillo hexagonal 10mm",
      MENGE: "150",
      MEINS: "UN",
      CASES: [
        {
          CASE: "CASE001",
          UBICACION: "A-01-01",
          CANTIDAD: "50",
        },
        {
          CASE: "CASE002",
          UBICACION: "A-01-02",
          CANTIDAD: "30",
        },
        {
          CASE: "CASE003",
          UBICACION: "B-02-01",
          CANTIDAD: "70",
        },
      ],
    },
    {
      MATNR: "MAT002",
      MAKTX: "Tuerca de seguridad 8mm",
      MENGE: "200",
      MEINS: "UN",
      CASES: [
        {
          CASE: "CASE004",
          UBICACION: "C-03-01",
          CANTIDAD: "100",
        },
        {
          CASE: "CASE005",
          UBICACION: "C-03-02",
          CANTIDAD: "100",
        },
      ],
    },
    {
      MATNR: "MAT003",
      MAKTX: "Cable eléctrico 2.5mm (rollo)",
      MENGE: "10",
      MEINS: "RL",
      CASES: [
        {
          CASE: "CASE006",
          UBICACION: "D-04-01",
          CANTIDAD: "5",
        },
        {
          CASE: "CASE007",
          UBICACION: "D-04-02",
          CANTIDAD: "5",
        },
      ],
    },
  ],
}

// Datos adicionales para otras reservas
export const reservasData: ReservaData[] = [
  mockReservaData,
  {
    RESERVA: "1000045679",
    MATERIALES: [
      {
        MATNR: "MAT004",
        MAKTX: 'Válvula de control 1/2"',
        MENGE: "25",
        MEINS: "UN",
        CASES: [
          {
            CASE: "CASE008",
            UBICACION: "E-05-01",
            CANTIDAD: "15",
          },
          {
            CASE: "CASE009",
            UBICACION: "E-05-02",
            CANTIDAD: "10",
          },
        ],
      },
      {
        MATNR: "MAT005",
        MAKTX: "Sensor de temperatura PT100",
        MENGE: "15",
        MEINS: "UN",
        CASES: [
          {
            CASE: "CASE010",
            UBICACION: "F-06-01",
            CANTIDAD: "8",
          },
          {
            CASE: "CASE011",
            UBICACION: "F-06-02",
            CANTIDAD: "7",
          },
        ],
      },
    ],
  },
  {
    RESERVA: "1000045680",
    MATERIALES: [
      {
        MATNR: "MAT006",
        MAKTX: "Filtro hidráulico 10 micras",
        MENGE: "30",
        MEINS: "UN",
        CASES: [
          {
            CASE: "CASE012",
            UBICACION: "G-07-01",
            CANTIDAD: "20",
          },
          {
            CASE: "CASE013",
            UBICACION: "G-07-02",
            CANTIDAD: "10",
          },
        ],
      },
      {
        MATNR: "MAT007",
        MAKTX: 'Manguera de presión 1"',
        MENGE: "50",
        MEINS: "MT",
        CASES: [
          {
            CASE: "CASE014",
            UBICACION: "H-08-01",
            CANTIDAD: "30",
          },
          {
            CASE: "CASE015",
            UBICACION: "H-08-02",
            CANTIDAD: "20",
          },
        ],
      },
      {
        MATNR: "MAT008",
        MAKTX: "Conector rápido neumático",
        MENGE: "100",
        MEINS: "UN",
        CASES: [
          {
            CASE: "CASE016",
            UBICACION: "I-09-01",
            CANTIDAD: "60",
          },
          {
            CASE: "CASE017",
            UBICACION: "I-09-02",
            CANTIDAD: "40",
          },
        ],
      },
    ],
  },
]

// Función para buscar una reserva por número
export function findReservaByNumber(reservaNumber: string): ReservaData | undefined {
  return reservasData.find((reserva) => reserva.RESERVA === reservaNumber)
}

