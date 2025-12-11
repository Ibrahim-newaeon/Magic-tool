import React from 'react';
import { ProductInfo } from '../types/offerTemplate';
import { Tag } from 'lucide-react';

interface ProductFormProps {
  product: ProductInfo;
  onChange: (next: ProductInfo) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onChange }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Tag size={18} className="text-emerald-400" /> Product Details
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Product Name</label>
          <input 
            type="text" 
            value={product.name}
            onChange={e => onChange({...product, name: e.target.value})}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500"
            placeholder="e.g. Summer Floral Dress"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">SKU / Code</label>
            <input 
              type="text" 
              value={product.id}
              onChange={e => onChange({...product, id: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="#SUM-001"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Currency</label>
            <select 
              value={product.currency}
              onChange={e => onChange({...product, currency: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="£">£ GBP</option>
              <option value="¥">¥ JPY</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Original Price</label>
            <input 
              type="number" 
              value={product.priceBefore || ''}
              onChange={e => onChange({...product, priceBefore: parseFloat(e.target.value) || 0})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="99.00"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Sale Price</label>
            <input 
              type="number" 
              value={product.priceAfter || ''}
              onChange={e => onChange({...product, priceAfter: parseFloat(e.target.value) || 0})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold text-emerald-400"
              placeholder="49.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};