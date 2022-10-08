function TokenAttribute( {attribute} ) {
  return (
    <>
    <div className="card">
        <div className="card-body card-body-tight">
            <h6 className="token-title card-subtitle text-muted text-center">{ attribute.trait_type ? attribute.trait_type : 'Property' }</h6>
            <h5 className="token-value text-center">{ attribute.value }</h5>
        </div>
    </div>
    </>
  );
}

export default TokenAttribute;