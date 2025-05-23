import type { ReactNode } from 'react';

export interface DataItem {
  label: string;
  value: string | number;
}

export interface DataGroup {
  id: string;
  title: string;
  icon: ReactNode;
  items: DataItem[];
}

export interface Data {
  EMBAL: string;
  MBLNR: string;
  ERFME: string;
  POSNR: string;
  MATNR: string;
  MAKTX: string;
  MENGE: string;
  ZSTAT: string;
  ZUSER: string;
  ZFECH: string;
  ZHORA: string;
  PSPNR: string;
  WERKS: string;
  LGORT: string;
  ZUBIC: string;
  ZCONF: string;
  ZFECH_WMS: string;
  ZHORA_WMS: string;
  ZUSER_WMS: string;
  ZEXCU_WMS: string;
  ZEXDE_WMS: string;
}

export interface UbicacionLog {
  _id: string;
  embal: string;
  ubicacionAnterior: string;
  ubicacionNueva: string;
  usuario: string;
  fecha: string;
  matnr?: string;
  maktx?: string;
  createdAt: string;
}

// Interfaz para el formulario, si se decide moverla aquí también.
// Por ahora, se asume que sigue en ../types o local.
/*
export interface viewEmbalForm {
  embal: string;
}
*/
