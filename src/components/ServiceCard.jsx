import { Link } from 'react-router-dom'
import { Star, MapPin, Clock } from 'lucide-react'

export default function ServiceCard({ service }) {
    const {
        id,
        title,
        category,
        price,
        image,
        rating,
        reviews,
        professionalName,
        location,
        responseTime,
    } = service

    return (
        <Link to={`/service/${id}`}>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-200 h-40">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover hover:scale-110 transition"
                    />
                    <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded">
                        {category}
                    </span>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {title}
                    </h3>

                    {/* Professional Info */}
                    <p className="text-sm text-gray-600 mb-2">{professionalName}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={`${i < Math.floor(rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                            {rating}
                        </span>
                        <span className="text-xs text-gray-500">({reviews} avaliações)</span>
                    </div>

                    {/* Location and Response Time */}
                    <div className="flex flex-col gap-2 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>Responde em {responseTime}</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="pt-3 border-t">
                        <p className="text-lg font-bold text-primary-600">
                            R$ {price.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}
