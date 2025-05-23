import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  isMobile: boolean;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  totalFilteredUsers: number;
}

const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  paginate,
  nextPage,
  prevPage,
  isMobile,
  indexOfFirstItem,
  indexOfLastItem,
  totalFilteredUsers,
}) => {
  if (totalFilteredUsers === 0) {
    return null; // No mostrar paginación si no hay items
  }

  return (
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between border-t border-stroke py-4 px-4 md:px-6 dark:border-strokedark">
      <div className="mb-4 md:mb-0 flex items-center space-x-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isMobile
            ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalFilteredUsers)}/${totalFilteredUsers}`
            : `Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalFilteredUsers)} de ${totalFilteredUsers} usuarios`}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            currentPage === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {isMobile ? (
          <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-primary text-white">
            {currentPage}
          </span>
        ) : (
          Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
            if (
              number === 1 ||
              number === totalPages ||
              (number >= currentPage - 1 && number <= currentPage + 1)
            ) {
              return (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    currentPage === number
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  aria-label={`Ir a página ${number}`}
                >
                  {number}
                </button>
              )
            }
            if (
              (number === 2 && currentPage > 3) ||
              (number === totalPages - 1 && currentPage < totalPages - 2)
            ) {
              return (
                <span
                  key={number}
                  className="flex h-8 w-8 items-center justify-center text-gray-600 dark:text-gray-300"
                >
                  ...
                </span>
              )
            }
            return null
          })
        )}

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            currentPage === totalPages
              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UserPagination;
