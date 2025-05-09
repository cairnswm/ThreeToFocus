import { Folder, ArrowUpRight, ChevronRight, Star, Lightbulb, Bug } from 'some-icon-library';
import { useNavigate } from 'react-router-dom';

const ProductCardHeader = ({ product, handleNavigate }) => (
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
    <button
      onClick={(e) => handleNavigate(e, product.id)}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded relative"
    >
      <Folder className="h-5 w-5 text-gray-400" />
      <ArrowUpRight className="h-4 w-4 text-indigo-500 absolute -top-1 -right-1" />
    </button>
  </div>
);

const ProductCardBody = ({ product }) => (
  <div className="flex items-center mb-2">
    <Star className="h-5 w-5 text-yellow-400 fill-current" />
    <span className="ml-2 text-gray-700">{product.reviewAverage.toFixed(1)}</span>
    <span className="ml-2 text-gray-500">({product.reviewCount} reviews)</span>
  </div>
);

const ProductCardFooter = ({ product }) => (
  <div className="flex items-center space-x-4 mb-4">
    <div className="flex items-center">
      <Lightbulb className="h-5 w-5 text-purple-500" />
      <span className="ml-2 text-gray-600">{product.featureRequestCount} features</span>
    </div>
    <div className="flex items-center">
      <Bug className="h-5 w-5 text-red-500" />
      <span className="ml-2 text-gray-600">{product.bugCount} bugs</span>
    </div>
  </div>
);

const ProductCard = ({ product, onProductClick }) => {
  const navigate = useNavigate();

  const handleNavigate = (e, id) => {
    e.stopPropagation();
    navigate(`/move/${id}`);
  };

  const FolderContent = () => (
    <div className="flex items-center space-x-3">
      <Folder className="h-6 w-6 text-indigo-500" />
      <div className="flex-1">
        <ProductCardHeader product={product} handleNavigate={handleNavigate} />
        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );

  const ProductDetails = () => (
    <>
      <ProductCardHeader product={product} handleNavigate={handleNavigate} />
      <ProductCardBody product={product} />
      <ProductCardFooter product={product} />
      <p className="text-sm text-gray-600">{product.description}</p>
    </>
  );

  return (
    <div
      onClick={(e) => onProductClick(product, e)}
      className="group bg-gray-50 rounded-lg shadow-sm overflow-hidden cursor-pointer transform transition-transform hover:scale-105 hover:shadow-md"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        {product.type === 'folder' ? <FolderContent /> : <ProductDetails />}
      </div>
    </div>
  );
};

export default ProductCard;