import { BRAND } from '../../types/brand';
import BrandOne from '../../images/brand/brand-01.svg';
import BrandTwo from '../../images/brand/brand-02.svg';
import BrandThree from '../../images/brand/brand-03.svg';
import BrandFour from '../../images/brand/brand-04.svg';
import BrandFive from '../../images/brand/brand-05.svg';

const brandData: BRAND[] = [
  {
    logo: BrandOne,
    name: 'Google',
    visitors: 3.5,
    revenues: '5,768',
    sales: 590,
    conversion: 4.8,
  },
  {
    logo: BrandTwo,
    name: 'Twitter',
    visitors: 2.2,
    revenues: '4,635',
    sales: 467,
    conversion: 4.3,
  },
  {
    logo: BrandThree,
    name: 'Github',
    visitors: 2.1,
    revenues: '4,290',
    sales: 420,
    conversion: 3.7,
  },
  {
    logo: BrandFour,
    name: 'Vimeo',
    visitors: 1.5,
    revenues: '3,580',
    sales: 389,
    conversion: 2.5,
  },
  {
    logo: BrandFive,
    name: 'Facebook',
    visitors: 3.5,
    revenues: '6,768',
    sales: 390,
    conversion: 4.2,
  },
];

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top Channels
      </h4>

      <div className="max-w-full overflow-x-auto"> {/* Para responsividad en tablas */}
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Source
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white text-center">
                Visitors
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white text-center">
                Revenues
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-center hidden sm:table-cell"> {/* Ocultar en sm y mostrar como table-cell */}
                Sales
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white text-center hidden sm:table-cell"> {/* Ocultar en sm y mostrar como table-cell */}
                Conversion
              </th>
            </tr>
          </thead>
          <tbody>
            {brandData.map((brand, key) => (
              <tr key={key} className={`${key === brandData.length -1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}>
                <td className="py-5 px-4 pl-9 xl:pl-11"> {/* Ajusta el padding si es necesario */}
                  <div className="flex items-center gap-3"> {/* Mantén el flex para el logo y el nombre */}
                    <div className="flex-shrink-0">
                      <img src={brand.logo} alt="Brand" loading="lazy" />
                    </div>
                    <p className="hidden text-black dark:text-white sm:block">
                      {brand.name}
                    </p>
                  </div>
                </td>
                <td className="py-5 px-4 text-center">
                  <p className="text-black dark:text-white">{brand.visitors}K</p>
                </td>
                <td className="py-5 px-4 text-center">
                  <p className="text-meta-3">${brand.revenues}</p>
                </td>
                <td className="py-5 px-4 text-center hidden sm:table-cell">
                  <p className="text-black dark:text-white">{brand.sales}</p>
                </td>
                <td className="py-5 px-4 text-center hidden sm:table-cell">
                  <p className="text-meta-5">{brand.conversion}%</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOne;
