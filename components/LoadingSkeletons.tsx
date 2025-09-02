export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm">
    <div className="skeleton h-32 w-full rounded-xl mb-3"></div>
    <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
    <div className="skeleton h-3 w-1/2 rounded mb-3"></div>
    <div className="skeleton h-8 w-full rounded-lg"></div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex gap-4 overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex-shrink-0">
        <div className="skeleton h-16 w-16 rounded-full mb-2"></div>
        <div className="skeleton h-3 w-12 rounded"></div>
      </div>
    ))}
  </div>
);

export const CartItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <div className="skeleton h-12 w-12 rounded-lg"></div>
    <div className="flex-1">
      <div className="skeleton h-4 w-3/4 rounded mb-1"></div>
      <div className="skeleton h-3 w-1/2 rounded"></div>
    </div>
    <div className="skeleton h-8 w-16 rounded"></div>
  </div>
);