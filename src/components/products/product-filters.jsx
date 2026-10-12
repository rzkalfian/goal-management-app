import { MagnifierIcon } from "@solar-icons/react/linear";
import { STATUSES } from "@/core/entities/product";

export function ProductFilters({
  products,
  categories,
  status,
  setStatus,
  query,
  setQuery,
  category,
  setCategory,
}) {
  return (
    <div className="catalog-toolbar">
      <div className="status-tabs" aria-label="Filter status">
        {[["", "Semua"], ...Object.entries(STATUSES)].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
          >
            {label}
            <span className="tab-count">
              {
                products.filter((product) => !value || product.status === value)
                  .length
              }
            </span>
          </button>
        ))}
      </div>
      <div className="catalog-search">
        <div className="search-field">
          <MagnifierIcon size={18} />
          <input
            type="search"
            aria-label="Cari barang"
            placeholder="Cari barang..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          aria-label="Filter kategori"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Semua kategori</option>
          {categories.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
