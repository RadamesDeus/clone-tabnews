function status( request, response ) {
  response.status( 200 ).json( { chave: "Radamés Deus" } )
}

export default status