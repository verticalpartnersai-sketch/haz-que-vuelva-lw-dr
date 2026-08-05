type OfferPriceProps = {
  originalPrice?: string;
  price: string;
  priceLabel: string;
};

export function OfferPrice({ originalPrice, price, priceLabel }: OfferPriceProps) {
  return (
    <div className={`r30-price${originalPrice ? " r30-price--comparison" : ""}`}>
      <span>
        {originalPrice ? (
          <>
            Precio anterior <del>{originalPrice}</del>
          </>
        ) : (
          priceLabel
        )}
      </span>
      <strong>
        {originalPrice ? (
          <>
            <small>AHORA</small>
            {price}
          </>
        ) : (
          price
        )}
      </strong>
    </div>
  );
}
