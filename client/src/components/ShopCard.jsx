import { Link } from 'react-router-dom';

export default function ShopCard({ shop }) {
  return (
    <Link to={`/customer/shops/${shop._id}`} className="glass shop-card">
      <div className="shop-cover">
        {shop.image ? <img src={shop.image} alt={shop.name} /> : <span>🍴</span>}
      </div>
      <div className="shop-body">
        <div className="row-between">
          <h3>{shop.name}</h3>
          <span className={`pill ${shop.isOpen ? 'pill-green' : 'pill-red'}`}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <p className="muted">{shop.description || 'Freshly prepared meals'}</p>
      </div>
    </Link>
  );
}
