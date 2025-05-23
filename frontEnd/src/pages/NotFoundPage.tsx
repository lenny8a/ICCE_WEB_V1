import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-boxdark-2 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-2xl text-black dark:text-white mb-8">
        Oops! Página no encontrada.
      </p>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link
        to="/"
        className="px-6 py-3 text-lg font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
